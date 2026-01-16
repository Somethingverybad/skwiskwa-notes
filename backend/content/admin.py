from django.contrib import admin
from .models import Page, Block, Comment


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'created_at', 'updated_at']
    search_fields = ['title', 'owner__username']
    list_filter = ['created_at', 'updated_at', 'owner']


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ['page', 'block_type', 'content_preview', 'order', 'created_at']
    list_filter = ['block_type', 'created_at']
    search_fields = ['content']
    
    def content_preview(self, obj):
        return obj.content[:50] if obj.content else '-'
    content_preview.short_description = 'Содержимое'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['block', 'content_preview', 'created_at']
    list_filter = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50]
    content_preview.short_description = 'Содержимое'
