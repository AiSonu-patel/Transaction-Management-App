from django.shortcuts import render
from rest_framework import generics, filters
from .models import Transaction
from .serializers import TransactionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


class TransactionListCreateView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['amount', 'transaction_type', 'comment']

class TransactionDetaiView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class TransactionDashboardView(APIView):
    def get(self, request):
        transactions = Transaction.objects.all()

        credit = 0
        debit = 0
        for t in transactions:
            if(t.transaction_type == 'CREDIT'):
                credit += t.amount
            elif(t.transaction_type == 'DEBIT'):
                debit += t.amount


        return Response({
            'total_balance': credit - debit,
            'total_credit': credit,
            'total_debit': debit,
        })