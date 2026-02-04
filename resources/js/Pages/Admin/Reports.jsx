import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Download,
    Refresh,
    Analytics,
    TableChart,
    BarChart,
    PieChart
} from '@mui/icons-material';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

const Reports = ({ auth, reports = [], summary = {}, charts = {}, filters = {} }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const { data, setData, get, post, processing, errors } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        report_type: filters.report_type || 'overview',
        phc_id: filters.phc_id || '',
        status: filters.status || ''
    });

    const handleGenerateReport = () => {
        get(route('admin.reports.index'), {
            data,
            preserveState: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false)
        });
    };

    const handleExportExcel = () => {
        post(route('admin.reports.export'), data, {
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false)
        });
    };

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    // Literacy status chart data
    const literacyData = charts.literacy_status || [
        { name: 'Literate', value: 0 },
        { name: 'Illiterate', value: 0 },
        { name: 'Not sure', value: 0 }
    ];

    // ANC completion chart data
    const ancData = charts.anc_completion || [
        { name: 'ANC4 Completed', value: 0 },
        { name: 'ANC Incomplete', value: 0 }
    ];

    // Delivery outcomes chart data
    const deliveryData = charts.delivery_outcomes || [
        { name: 'Live Birth', value: 0 },
        { name: 'Stillbirth', value: 0 }
    ];

    // Monthly registrations chart data
    const monthlyData = charts.monthly_registrations || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Analytics sx={{ fontSize: 32 }} />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Maternity Care Reports
                    </Typography>
                </Box>
            }
        >
            <Head title="Admin Reports" />

            <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 3 }}>
                {/* Filters Card */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Report Filters
                        </Typography>
                        <Grid container spacing={3} alignItems="flex-end">
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Report Type</InputLabel>
                                    <Select
                                        value={data.report_type}
                                        label="Report Type"
                                        onChange={(e) => setData('report_type', e.target.value)}
                                    >
                                        <MenuItem value="overview">Overview Dashboard</MenuItem>
                                        <MenuItem value="patients">Patient Details</MenuItem>
                                        <MenuItem value="anc_tracking">ANC Tracking</MenuItem>
                                        <MenuItem value="delivery_outcomes">Delivery Outcomes</MenuItem>
                                        <MenuItem value="phc_performance">PHC Performance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={data.status}
                                        label="Status"
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleGenerateReport}
                                        disabled={processing}
                                        startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                                    >
                                        Generate Report
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleExportExcel}
                                        disabled={processing || reports.length === 0}
                                        startIcon={<Download />}
                                    >
                                        Export CSV
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Tabs for different views */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab icon={<Analytics />} label="Overview" />
                        <Tab icon={<TableChart />} label="Raw Data" />
                        <Tab icon={<BarChart />} label="Charts" />
                    </Tabs>
                </Box>

                {/* Overview Tab */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {/* Summary Cards */}
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Total Patients
                                            </Typography>
                                            <Typography variant="h4" component="div">
                                                {summary.total_patients || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                ANC4 Completed
                                            </Typography>
                                            <Typography variant="h4" component="div" color="success.main">
                                                {summary.anc4_completed || 0}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {summary.anc4_completion_rate || 0}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                PNC Completed
                                            </Typography>
                                            <Typography variant="h4" component="div" color="info.main">
                                                {summary.pnc_completed || 0}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {summary.pnc_completion_rate || 0}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                Live Births
                                            </Typography>
                                            <Typography variant="h4" component="div" color="primary.main">
                                                {summary.live_births || 0}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Charts Row 1 */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Literacy Status Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={literacyData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {literacyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        ANC Completion Status
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsBarChart data={ancData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Charts Row 2 */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Delivery Outcomes
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={deliveryData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {deliveryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Monthly Registrations
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="registrations" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Raw Data Tab */}
                {activeTab === 1 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Patient Data ({reports.length} records)
                            </Typography>
                            
                            {reports.length === 0 ? (
                                <Alert severity="info">
                                    No report data available. Please generate a report using the filters above.
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Woman Name</TableCell>
                                                <TableCell>Age</TableCell>
                                                <TableCell>Literacy</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>Gravida</TableCell>
                                                <TableCell>Parity</TableCell>
                                                <TableCell>EDD</TableCell>
                                                <TableCell>ANC Visits</TableCell>
                                                <TableCell>ANC4</TableCell>
                                                <TableCell>Delivery</TableCell>
                                                <TableCell>Outcome</TableCell>
                                                <TableCell>PNC</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reports.map((patient, index) => (
                                                <TableRow key={patient.id || index}>
                                                    <TableCell>{patient.unique_id}</TableCell>
                                                    <TableCell>{patient.woman_name}</TableCell>
                                                    <TableCell>{patient.age}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.literacy_status} 
                                                            size="small"
                                                            color={
                                                                patient.literacy_status === 'Literate' ? 'success' :
                                                                patient.literacy_status === 'Illiterate' ? 'warning' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>{patient.phone_number}</TableCell>
                                                    <TableCell>{patient.gravida}</TableCell>
                                                    <TableCell>{patient.parity}</TableCell>
                                                    <TableCell>
                                                        {patient.edd ? new Date(patient.edd).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.anc_visits_count} 
                                                            size="small"
                                                            color={patient.anc_visits_count >= 4 ? 'success' : 'warning'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.anc4_completed ? 'Yes' : 'No'} 
                                                            size="small"
                                                            color={patient.anc4_completed ? 'success' : 'error'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.date_of_delivery ? new Date(patient.date_of_delivery).toLocaleDateString() : 'Pending'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.delivery_outcome || 'Pending'} 
                                                            size="small"
                                                            color={patient.delivery_outcome === 'Live birth' ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.pnc_completed ? 'Yes' : 'No'} 
                                                            size="small"
                                                            color={patient.pnc_completed ? 'success' : 'error'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={patient.alert || 'Active'} 
                                                            size="small"
                                                            color={
                                                                patient.alert?.includes('Overdue') ? 'error' :
                                                                patient.alert?.includes('Needs') ? 'warning' : 'success'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Charts Tab */}
                {activeTab === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Age Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RechartsBarChart data={charts.age_distribution || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age_group" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8884d8" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Gravida Distribution
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RechartsBarChart data={charts.gravida_distribution || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="gravida" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#00C49F" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Insurance Status
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={charts.insurance_status || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {(charts.insurance_status || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Delivery Kit Reception
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={charts.delivery_kits || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {(charts.delivery_kits || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </AuthenticatedLayout>
    );
};

export default Reports;