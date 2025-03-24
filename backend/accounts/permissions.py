from rest_framework import permissions


class IsCourseAuthorOrSuperUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or obj.author == request.user