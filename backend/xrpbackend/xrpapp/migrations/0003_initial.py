# Generated by Django 4.2.7 on 2023-11-06 02:05

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('xrpapp', '0002_delete_wallet'),
    ]

    operations = [
        migrations.CreateModel(
            name='XRPWallet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('classic_address', models.CharField(max_length=200)),
                ('x_address', models.CharField(max_length=200)),
                ('public_key', models.CharField(max_length=200)),
                ('secret', models.CharField(max_length=200)),
                ('balance', models.DecimalField(decimal_places=6, max_digits=19)),
            ],
        ),
    ]
