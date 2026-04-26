const Order = require('../models/Order');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Sales & Total Orders
    const orders = await Order.find();
    // Normalize statuses to lowercase and handle legacy "Initiated" status
    const getStatus = (o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'initiated' ? 'pending' : s;
    };

    // Total Sales = sum of only delivered orders
    const totalSales = orders
      .filter(o => getStatus(o) === 'delivered')
      .reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalOrders = orders.length;

    // Active Orders = only pending + processing
    const activeOrders = orders.filter(o => ['pending', 'processing'].includes(getStatus(o))).length;
    const completedOrders = orders.filter(o => getStatus(o) === 'delivered').length;
    const pendingOrders = orders.filter(o => getStatus(o) === 'pending').length;

    // 3. Growth Rate (Dynamic)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(currentMonth - 1);
    
    const currentMonthSales = orders
      .filter(o => getStatus(o) === 'delivered' && new Date(o.createdAt).getMonth() === currentMonth && new Date(o.createdAt).getFullYear() === currentYear)
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const prevMonthSales = orders
      .filter(o => getStatus(o) === 'delivered' && new Date(o.createdAt).getMonth() === prevMonthDate.getMonth() && new Date(o.createdAt).getFullYear() === prevMonthDate.getFullYear())
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    let growthRate = 0;
    if (prevMonthSales > 0) {
      growthRate = ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100;
    } else if (currentMonthSales > 0) {
      growthRate = 100;
    }
    growthRate = parseFloat(growthRate.toFixed(1));

    // 4. Monthly Sales Data (Last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = Array(6).fill(0).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = months[d.getMonth()];
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return getStatus(o) === 'delivered' && orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
      });
      const sales = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      return { name: monthName, sales };
    });

    // 5. Category Distribution
    const products = await Product.find();
    const catCounts = {
      Men: products.filter(p => p.gender === 'Men').length,
      Women: products.filter(p => p.gender === 'Women').length,
      Kids: products.filter(p => p.gender === 'Kids').length,
    };
    const pieData = [
      { name: 'Men', value: catCounts.Men, color: '#3b82f6' },
      { name: 'Women', value: catCounts.Women, color: '#ec4899' },
      { name: 'Kids', value: catCounts.Kids, color: '#10b981' }
    ];

    console.log(`[Admin Stats] totalSales=₹${totalSales.toFixed(2)}, totalOrders=${totalOrders}, activeOrders=${activeOrders}, completedOrders=${completedOrders}`);

    res.status(200).json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      activeOrders,
      completedOrders,
      pendingOrders,
      growthRate,
      monthlySales,
      pieData
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};
