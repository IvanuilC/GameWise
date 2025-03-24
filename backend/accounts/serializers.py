from rest_framework import serializers
from .models import Course


class CourseSerializer:
    def __init__(self, instance=None, data=None):
        self.instance = instance
        self.data = data
        self.errors = {}

    def is_valid(self):
        if not self.data:
            self.errors['non_field_errors'] = ['No data provided']
            return False

        # Простая валидация
        self.errors = {}
        if not self.data.get('title'):
            self.errors['title'] = ['This field is required']

        return not bool(self.errors)

    def save(self):
        if self.instance:
            # Обновление существующего объекта
            return self._update()
        # Создание нового объекта (не требуется для вашего кейса)
        raise NotImplementedError

    def _update(self):
        # Обновляем только разрешенные поля
        allowed_fields = {'title', 'description', 'tags', 'content'}
        update_data = {k: v for k, v in self.data.items() if k in allowed_fields}

        for attr, value in update_data.items():
            setattr(self.instance, attr, value)

        self.instance.save()
        return self.instance

    def to_dict(self):
        return {
            "id": self.instance.id,
            "title": self.instance.title,
            "description": self.instance.description,
            "tags": self.instance.tags,
            "content": self.instance.content,
            "created_at": self.instance.created_at.isoformat(),
            "updated_at": self.instance.updated_at.isoformat()
        }