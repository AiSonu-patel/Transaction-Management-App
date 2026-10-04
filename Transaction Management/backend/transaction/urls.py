from django.urls import path
from .views import TransactionListCreateView, TransactionDashboardView, TransactionDetaiView

urlpatterns = [
    path("transactions/", TransactionListCreateView.as_view(), name="transaction-list-create"),
    path('transactions/<int:pk>/', TransactionDetaiView.as_view(), name="transactions-details"),
    path("dashboard/", TransactionDashboardView.as_view(), name="transaction-dashboard"),
]
