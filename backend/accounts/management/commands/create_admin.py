from django.core.management.base import BaseCommand
from django.db import IntegrityError
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create a QueueFlow admin account'

    def add_arguments(self, parser):
        parser.add_argument('--email',     default='admin@usiu.ac.ke')
        parser.add_argument('--password',  default='Admin@1234')
        parser.add_argument('--firstname', default='System')
        parser.add_argument('--lastname',  default='Admin')

    def handle(self, *args, **options):
        email    = options['email']
        password = options['password']

        if CustomUser.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin already exists: {email}'))
            return

        try:
            user = CustomUser(
                email=email,
                username=email.split('@')[0],
                first_name=options['firstname'],
                last_name=options['lastname'],
                role='admin',
                is_verified=True,
                is_superuser=True,
                is_staff=True,
            )
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'\nAdmin account created:\n'
                f'  Email:    {email}\n'
                f'  Password: {password}\n'
                f'  Role:     admin\n'
            ))
        except IntegrityError as e:
            self.stdout.write(self.style.ERROR(f'Failed: {e}'))
