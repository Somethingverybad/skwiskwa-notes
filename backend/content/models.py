from django.db import models
from django.contrib.auth.models import User


class Page(models.Model):
    """Модель страницы (аналог страницы в Notion)"""
    title = models.CharField(max_length=255, default='Без названия', blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)  # Эмодзи или иконка
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pages', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    def save(self, *args, **kwargs):
        # Если title пустой, устанавливаем дефолтное значение ТОЛЬКО при создании новой страницы
        # При обновлении разрешаем пустое значение, чтобы пользователь мог стереть заголовок полностью
        if self.pk is None and (not self.title or self.title.strip() == ''):
            self.title = 'Без названия'
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title


class Block(models.Model):
    """Модель блока контента"""
    
    BLOCK_TYPES = (
        ('text', 'Текст'),
        ('heading1', 'Заголовок 1'),
        ('heading2', 'Заголовок 2'),
        ('heading3', 'Заголовок 3'),
        ('image', 'Изображение'),
        ('video', 'Видео'),
        ('audio', 'Аудио'),
        ('file', 'Файл'),
        ('quote', 'Цитата'),
        ('list', 'Список'),
        ('checkbox', 'Чекбокс'),
        ('divider', 'Разделитель'),
    )
    
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='blocks')
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES, default='text')
    content = models.TextField(blank=True, default='')
    
    # Для медиа-файлов
    file = models.FileField(upload_to='blocks/%Y/%m/%d/', null=True, blank=True)
    file_type = models.CharField(max_length=50, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    
    # Для чекбоксов
    checked = models.BooleanField(default=False)
    
    # Порядок блоков на странице
    order = models.IntegerField(default=0)
    
    # Вложенность (для списков и т.д.)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.block_type} - {self.content[:50]}"


class Comment(models.Model):
    """Модель комментариев к блокам"""
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Комментарий: {self.content[:50]}"
