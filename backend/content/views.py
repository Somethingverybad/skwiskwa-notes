from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Page, Block, Comment
from .serializers import (
    PageSerializer, PageListSerializer, 
    BlockSerializer, CommentSerializer
)


class PageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Возвращаем только страницы текущего пользователя"""
        return Page.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PageListSerializer
        return PageSerializer
    
    def perform_create(self, serializer):
        """При создании страницы автоматически устанавливаем владельца"""
        serializer.save(owner=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Переопределяем list для отключения пагинации"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Дублирование страницы со всеми блоками"""
        page = self.get_object()
        
        with transaction.atomic():
            # Копируем страницу
            new_page = Page.objects.create(
                title=f"{page.title} (копия)",
                icon=page.icon,
                parent=page.parent
            )
            
            # Копируем все блоки
            for block in page.blocks.all():
                Block.objects.create(
                    page=new_page,
                    block_type=block.block_type,
                    content=block.content,
                    checked=block.checked,
                    order=block.order
                )
        
        serializer = self.get_serializer(new_page)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BlockViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BlockSerializer
    
    def get_queryset(self):
        """Возвращаем блоки только со страниц текущего пользователя"""
        queryset = Block.objects.filter(page__owner=self.request.user)
        page_id = self.request.query_params.get('page', None)
        if page_id is not None:
            queryset = queryset.filter(page_id=page_id, page__owner=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Проверяем, что страница принадлежит пользователю"""
        page_id = serializer.validated_data.get('page').id
        page = Page.objects.get(id=page_id)
        if page.owner != self.request.user:
            raise PermissionError("Вы не можете создавать блоки на этой странице")
        serializer.save()
    
    def list(self, request, *args, **kwargs):
        """Переопределяем list для отключения пагинации"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Изменение порядка блоков"""
        blocks_order = request.data.get('blocks', [])
        
        with transaction.atomic():
            for item in blocks_order:
                Block.objects.filter(id=item['id']).update(order=item['order'])
        
        return Response({'status': 'success'})
    
    @action(detail=True, methods=['post'])
    def upload_file(self, request, pk=None):
        """Загрузка файла для блока"""
        block = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'Файл не предоставлен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        block.file = file
        block.file_type = file.content_type
        block.file_size = file.size
        block.save()
        
        serializer = self.get_serializer(block)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        """Возвращаем комментарии только к блокам пользователя"""
        queryset = Comment.objects.filter(block__page__owner=self.request.user)
        block_id = self.request.query_params.get('block', None)
        if block_id is not None:
            queryset = queryset.filter(block_id=block_id, block__page__owner=self.request.user)
        return queryset
