# Generated by Django 4.2.7 on 2023-12-14 17:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('xrpapp', '0006_remove_xrprealwallet_balancetwo'),
    ]

    operations = [
        migrations.AddField(
            model_name='xrprealwallet',
            name='user_id',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='xrptestwallet',
            name='user_id',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
