from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Shorturl(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=40)
    original = models.URLField()
    short_id = models.CharField(max_length=6, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)
    clicks = models.PositiveIntegerField(default=0, blank=True)
    active = models.BooleanField(default=True)


    def __str__(self):
        return f'link {self.short_id} of { self.author.username }'

    
    def serialize(self):
        return {
            'pk' : self.pk,
            'title': self.title,
            'original': self.original,
            'short_id': self.short_id,
            'date_created': self.date_created.strftime("%b %d, %Y %H:%M"),
            'clicks': self.clicks,
            'active': self.active
        }