from django.db import models

# Create your models here.
class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit')
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    comment = models.TextField(blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    transaction_type = models.CharField(max_length=6, choices=TRANSACTION_TYPES)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"