
from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'code')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_code = serializers.ReadOnlyField(source='category.code')
    
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'price', 'category', 
            'category_name', 'category_code', 'image', 
            'is_best_seller', 'stock', 'created_at', 'updated_at'
        )


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.code')
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'category', 'image', 'is_best_seller')
