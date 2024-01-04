# xrpapp/urls.py

from django.urls import path
from .views import create_test_wallet, create_wallet, get_account_info, send_xrp_transaction, delete_test_wallet, list_real_wallets, delete_real_wallet
from . import views  # This line imports the views module from the current package


urlpatterns = [
    path('', views.home, name='home'),
    path('createtestwallet/', views.create_test_wallet, name='create_test_wallet'),
    path('createwallet/', views.create_wallet, name='create_wallet'),
    path('getaccountinfo/', views.get_account_info, name='get_account_info'),
    path('sendxrptransaction/', views.send_xrp_transaction, name="send_xrp_transaction"),
    path('deletetestwallet/', views.delete_test_wallet, name='delete_test_wallet'),
    path('listtestwallets/', views.list_test_wallets, name='list_test_wallets'),
    path('listrealwallets/', views.list_real_wallets, name='list_real_wallets'),
    path('deleterealwallet/', views.delete_real_wallet, name='delete_real_wallet')
]
