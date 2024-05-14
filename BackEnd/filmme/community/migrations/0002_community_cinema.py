# Generated by Django 5.0.4 on 2024-05-13 14:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0001_initial'),
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='community',
            name='cinema',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='community_cinema', to='main.cinema'),
        ),
    ]
