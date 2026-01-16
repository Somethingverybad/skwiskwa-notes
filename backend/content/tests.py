from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Page, Block


class PageAPITestCase(TestCase):
    """Тесты для API страниц"""
    
    def setUp(self):
        self.client = APIClient()
        self.page = Page.objects.create(title='Тестовая страница')
    
    def test_get_pages(self):
        """Тест получения списка страниц"""
        response = self.client.get('/api/pages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_page(self):
        """Тест создания страницы"""
        data = {'title': 'Новая страница'}
        response = self.client.post('/api/pages/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Page.objects.count(), 2)
    
    def test_update_page(self):
        """Тест обновления страницы"""
        data = {'title': 'Обновленная страница'}
        response = self.client.patch(f'/api/pages/{self.page.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.page.refresh_from_db()
        self.assertEqual(self.page.title, 'Обновленная страница')
    
    def test_delete_page(self):
        """Тест удаления страницы"""
        response = self.client.delete(f'/api/pages/{self.page.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Page.objects.count(), 0)


class BlockAPITestCase(TestCase):
    """Тесты для API блоков"""
    
    def setUp(self):
        self.client = APIClient()
        self.page = Page.objects.create(title='Тестовая страница')
        self.block = Block.objects.create(
            page=self.page,
            block_type='text',
            content='Тестовый блок'
        )
    
    def test_get_blocks(self):
        """Тест получения блоков страницы"""
        response = self.client.get(f'/api/blocks/?page={self.page.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_block(self):
        """Тест создания блока"""
        data = {
            'page': self.page.id,
            'block_type': 'heading1',
            'content': 'Заголовок',
            'order': 1
        }
        response = self.client.post('/api/blocks/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Block.objects.count(), 2)
    
    def test_update_block(self):
        """Тест обновления блока"""
        data = {'content': 'Обновленный контент'}
        response = self.client.patch(f'/api/blocks/{self.block.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.block.refresh_from_db()
        self.assertEqual(self.block.content, 'Обновленный контент')
    
    def test_reorder_blocks(self):
        """Тест изменения порядка блоков"""
        block2 = Block.objects.create(
            page=self.page,
            block_type='text',
            content='Второй блок',
            order=1
        )
        data = {
            'blocks': [
                {'id': block2.id, 'order': 0},
                {'id': self.block.id, 'order': 1}
            ]
        }
        response = self.client.post('/api/blocks/reorder/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        block2.refresh_from_db()
        self.block.refresh_from_db()
        self.assertEqual(block2.order, 0)
        self.assertEqual(self.block.order, 1)


class BlockModelTestCase(TestCase):
    """Тесты для модели Block"""
    
    def setUp(self):
        self.page = Page.objects.create(title='Тестовая страница')
    
    def test_create_text_block(self):
        """Тест создания текстового блока"""
        block = Block.objects.create(
            page=self.page,
            block_type='text',
            content='Тестовый текст'
        )
        self.assertEqual(block.content, 'Тестовый текст')
        self.assertEqual(block.block_type, 'text')
    
    def test_create_checkbox_block(self):
        """Тест создания чекбокса"""
        block = Block.objects.create(
            page=self.page,
            block_type='checkbox',
            content='Задача',
            checked=True
        )
        self.assertTrue(block.checked)
    
    def test_block_ordering(self):
        """Тест порядка блоков"""
        block1 = Block.objects.create(page=self.page, block_type='text', order=2)
        block2 = Block.objects.create(page=self.page, block_type='text', order=1)
        block3 = Block.objects.create(page=self.page, block_type='text', order=0)
        
        blocks = list(Block.objects.filter(page=self.page))
        self.assertEqual(blocks[0], block3)
        self.assertEqual(blocks[1], block2)
        self.assertEqual(blocks[2], block1)
