export const mockUsers = [
    {
        id: '1',
        name: 'John Doe',
        email: 'student@campus.edu',
        role: 'student',
        phone: '9876543210',
        password: 'MockPass@123!'
    },
    {
        id: '2',
        name: 'Campus Cafe',
        email: 'cafe@campus.edu',
        role: 'vendor',
        vendorId: 'v1',
        password: 'MockPass@123!'
    },
    {
        id: '3',
        name: 'System Admin',
        email: 'admin@campus.edu',
        role: 'admin',
        phone: '9876543299',
        password: 'MockPass@123!'
    }
];

export const mockVendors = [
    {
        id: 'v1',
        businessName: 'Campus Cafe',
        description: 'Best coffee and snacks on campus',
        rating: 4.5,
        avgPreparationTime: 10,
        currentLoad: 5,
        categories: ['beverages', 'quick'],
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=500',
        isOpen: true
    },
    {
        id: 'v2',
        businessName: 'Spicy Corner',
        description: 'Authentic spicy meals',
        rating: 4.8,
        avgPreparationTime: 20,
        currentLoad: 12,
        categories: ['food', 'quick'],
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=500',
        isOpen: true
    },
    {
        id: 'v3',
        businessName: 'Sweet Treats',
        description: 'Desserts and ice creams',
        rating: 4.7,
        avgPreparationTime: 5,
        currentLoad: 2,
        categories: ['desserts'],
        imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=500',
        isOpen: true
    }
];

export const mockMenu = {
    'v1': [
        { id: 'm1', name: 'Cappuccino', description: 'Freshly brewed', price: 120, category: 'beverages', prepTime: 5 },
        { id: 'm2', name: 'Sandwich', description: 'Veg grilled sandwich', price: 150, category: 'quick', prepTime: 10 },
        { id: 'm3', name: 'Muffin', description: 'Chocolate chip', price: 80, category: 'desserts', prepTime: 2 }
    ],
    'v2': [
        { id: 'm4', name: 'Biryani', description: 'Chicken dum biryani', price: 250, category: 'food', prepTime: 20 },
        { id: 'm5', name: 'Rolls', description: 'Paneer tikka roll', price: 180, category: 'quick', prepTime: 12 }
    ],
    'v3': [
        { id: 'm6', name: 'Ice Cream', description: 'Vanilla scoop', price: 60, category: 'desserts', prepTime: 2 },
        { id: 'm7', name: 'Waffle', description: 'Belgian waffle', price: 140, category: 'desserts', prepTime: 8 }
    ]
};

export const mockOrders = [
    {
        id: 'o1',
        total: 120,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: [{ name: 'Cappuccino', price: 120, quantity: 1 }]
    },
    {
        id: 'o2',
        total: 250,
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        items: [{ name: 'Biryani', price: 250, quantity: 1 }]
    }
];
