# Generated by Django 4.2.17 on 2024-12-22 22:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_course_enrollment'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='end_date',
        ),
        migrations.RemoveField(
            model_name='course',
            name='max_participants',
        ),
        migrations.RemoveField(
            model_name='course',
            name='start_date',
        ),
    ]
