from django.db import models

class XRPTestWallet(models.Model):
    user_id = models.CharField(max_length=200, null=False)
    classic_address = models.CharField(max_length=200)
    x_address = models.CharField(max_length=200)
    public_key = models.CharField(max_length=200)
    secret = models.CharField(max_length=200)  # Be VERY cautious with storing secrets!
    balance = models.DecimalField(max_digits=19, decimal_places=6)

    def __str__(self):
        return self.classic_address


class XRPRealWallet(models.Model):
    user_id = models.CharField(max_length=200, null=False)
    classic_address = models.CharField(max_length=200)
    x_address = models.CharField(max_length=200)
    public_key = models.CharField(max_length=200)
    secret = models.CharField(max_length=200)  # Be VERY cautious with storing secrets!
    balance = models.DecimalField(max_digits=19, decimal_places=6)

    

    def __str__(self):
        return self.classic_address