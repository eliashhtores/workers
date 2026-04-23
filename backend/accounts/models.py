from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_WORKER = 'worker'
    ROLE_EMPLOYER = 'employer'
    ROLE_CHOICES = [
        (ROLE_WORKER, 'Worker'),
        (ROLE_EMPLOYER, 'Employer'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_WORKER)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.username
