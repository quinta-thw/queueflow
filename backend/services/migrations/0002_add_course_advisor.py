from django.db import migrations, models


def add_course_advisor(apps, schema_editor):
    Service = apps.get_model('services', 'Service')
    # Update descriptions for all existing services
    updates = {
        'Registrar':       'Academic records, transcripts, enrollment & graduation letters.',
        'Finance Office':  'Fee payments, balances, financial aid, invoices & receipts.',
        'Health Clinic':   'Medical consultations, prescriptions, referrals & student health.',
        'Student Affairs': 'Student welfare, counseling, clubs, discipline & campus life.',
        'ICT Support':     'Password resets, email setup, portal access & technical help.',
        'Library':         'Book borrowing, printing, research assistance & inter-library loans.',
        'Admissions':      'New student intake, transfers, re-admissions & documentation.',
        'Cafeteria':       'Meal plan management, catering bookings & dietary requests.',
    }
    for name, desc in updates.items():
        Service.objects.filter(name=name).update(description=desc)

    # Add Course Advisor if not already present
    Service.objects.get_or_create(
        name='Course Advisor',
        defaults={
            'icon': 'course_advisor',
            'description': 'Unit registration, course selection, academic planning & appeals.',
            'is_active': True,
            'opening_time': '08:00',
            'closing_time': '17:00',
        }
    )


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='service',
            name='icon',
            field=models.CharField(
                choices=[
                    ('registrar', 'Registrar'),
                    ('finance', 'Finance'),
                    ('health', 'Health Clinic'),
                    ('library', 'Library'),
                    ('ict', 'ICT Support'),
                    ('student_affairs', 'Student Affairs'),
                    ('admissions', 'Admissions'),
                    ('cafeteria', 'Cafeteria'),
                    ('course_advisor', 'Course Advisor'),
                ],
                default='registrar',
                max_length=30,
            ),
        ),
        migrations.RunPython(add_course_advisor, migrations.RunPython.noop),
    ]
