from rest_framework import serializers
from .models import Page, Block, Comment


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'block', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BlockSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Block
        fields = ['id', 'page', 'block_type', 'content', 'file', 'file_url', 
                  'file_type', 'file_size', 'checked', 'order', 'parent', 
                  'created_at', 'updated_at', 'comments']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class PageSerializer(serializers.ModelSerializer):
    blocks = BlockSerializer(many=True, read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'icon', 'cover_image', 'cover_image_url', 
                  'parent', 'created_at', 'updated_at', 'blocks']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'title': {'allow_blank': True, 'required': False},
        }
    
    def validate_title(self, value):
        # Разрешаем пустую строку при обновлении
        # При создании дефолтное значение будет установлено в модели
        if value is None:
            return ''
        # Возвращаем как есть (включая пустую строку), нормализуем только пробелы
        return value.strip() if value.strip() else ''
    
    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
        return None


class PageListSerializer(serializers.ModelSerializer):
    """Облегченный сериализатор для списка страниц"""
    blocks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'icon', 'parent', 'created_at', 'updated_at', 'blocks_count']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'title': {'allow_blank': True, 'required': False},
        }
    
    def validate_title(self, value):
        # Разрешаем пустую строку при обновлении
        if value is None:
            return ''
        # Возвращаем как есть (включая пустую строку), нормализуем только пробелы
        return value.strip() if value.strip() else ''
    
    def get_blocks_count(self, obj):
        return obj.blocks.count()
