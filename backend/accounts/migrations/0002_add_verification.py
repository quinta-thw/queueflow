from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        # Add is_verified field
        migrations.AddField(
            model_name='customuser',
            name='is_verified',
            field=models.BooleanField(default=True),
        ),
        # Update role choices to include 'admin'
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[('student', 'Student'), ('staff', 'Staff'), ('admin', 'Admin')],
                default='student',
                max_length=10,
            ),
        ),
    ]
