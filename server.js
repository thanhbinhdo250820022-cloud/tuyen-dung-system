const http = require('http');
const https = require('https');

const DATABASE_URL = 'https://quan-ly-tuyen-dung-default-rtdb.asia-southeast1.firebasedatabase.app/';

// ============ FIREBASE REQUEST ============
function firebaseRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const firebaseUrl = `${DATABASE_URL}${path}.json`;
        const parsedUrl = new URL(firebaseUrl);

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.error || `Firebase error: ${res.statusCode}`));
                        return;
                    }
                    resolve(parsed);
                } catch (e) {
                    console.error('Firebase JSON parse error:', e.message, 'Body:', body.substring(0, 200));
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            console.error('Firebase request error:', err.message);
            reject(err);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Firebase request timeout'));
        });

        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// ============ PARSE COOKIES ============
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            if (name && value) {
                try {
                    cookies[name] = decodeURIComponent(value);
                } catch (e) {
                    cookies[name] = value;
                }
            }
        });
    }
    return cookies;
}

// ============ HTML SANITIZE ============
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// ============ LOGIN PAGE ============
function getLoginPage(error = '', success = '') {
    const safeError = escapeHtml(error);
    const safeSuccess = escapeHtml(success);

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập - Hệ thống Quản lý Tuyển dụng</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 100%; max-width: 420px; }
        .login-header { text-align: center; margin-bottom: 30px; }
        .login-header h1 { color: #333; font-size: 24px; margin-bottom: 8px; }
        .login-header p { color: #666; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 6px; color: #555; font-weight: 600; font-size: 14px; }
        .form-group input, .form-group select { width: 100%; padding: 12px 16px; border: 2px solid #e1e5e9; border-radius: 10px; font-size: 14px; transition: all 0.3s; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .btn-login { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
        .error { background: #fee; color: #c00; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; }
        .success { background: #efe; color: #0a0; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; }
        .toggle-form { text-align: center; margin-top: 20px; }
        .toggle-form a { color: #667eea; text-decoration: none; font-weight: 600; }
        .register-fields { display: none; }
        .show-register .register-fields { display: block; }
        .show-register .login-only { display: none; }
    </style>
</head>
<body>
    <div class="login-container" id="authContainer">
        <div class="login-header">
            <h1>🏢 Quản lý Tuyển dụng</h1>
            <p id="formTitle">Đăng nhập vào hệ thống</p>
        </div>
        ${safeError ? `<div class="error">${safeError}</div>` : ''}
        ${safeSuccess ? `<div class="success">${safeSuccess}</div>` : ''}
        <form method="POST" action="/login" id="authForm">
            <input type="hidden" name="action" id="formAction" value="login">
            <div class="form-group register-fields">
                <label>Họ và tên</label>
                <input type="text" name="fullName" placeholder="Nhập họ và tên">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="Nhập email" required>
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" name="password" placeholder="Nhập mật khẩu" required>
            </div>
            <div class="form-group register-fields">
                <label>Vai trò</label>
                <select name="role">
                    <option value="candidate">Ứng viên</option>
                    <option value="employer">Nhà tuyển dụng</option>
                </select>
            </div>
            <button type="submit" class="btn-login" id="submitBtn">Đăng nhập</button>
        </form>
        <div class="toggle-form">
            <span id="toggleText">Chưa có tài khoản?</span>
            <a href="#" id="toggleLink" onclick="toggleForm(); return false;">Đăng ký ngay</a>
        </div>
    </div>
    <script>
        let isRegister = false;
        function toggleForm() {
            isRegister = !isRegister;
            const container = document.getElementById('authContainer');
            const title = document.getElementById('formTitle');
            const btn = document.getElementById('submitBtn');
            const action = document.getElementById('formAction');
            const toggleText = document.getElementById('toggleText');
            const toggleLink = document.getElementById('toggleLink');
            const form = document.getElementById('authForm');
            if (isRegister) {
                container.classList.add('show-register');
                title.textContent = 'Tạo tài khoản mới';
                btn.textContent = 'Đăng ký';
                action.value = 'register';
                toggleText.textContent = 'Đã có tài khoản?';
                toggleLink.textContent = 'Đăng nhập';
                form.action = '/register';
            } else {
                container.classList.remove('show-register');
                title.textContent = 'Đăng nhập vào hệ thống';
                btn.textContent = 'Đăng nhập';
                action.value = 'login';
                toggleText.textContent = 'Chưa có tài khoản?';
                toggleLink.textContent = 'Đăng ký ngay';
                form.action = '/login';
            }
        }
    </script>
</body>
</html>`;
}

// ============ DASHBOARD PAGE ============
function getDashboardPage(user) {
    const isAdmin = user.role === 'admin';
    const isEmployer = user.role === 'employer';
    const isCandidate = user.role === 'candidate';

    const safeUser = {
        ...user,
        fullName: escapeHtml(user.fullName),
        email: escapeHtml(user.email)
    };

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Hệ thống Quản lý Tuyển dụng</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; }
        .navbar { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .navbar h1 { font-size: 20px; }
        .navbar .user-info { display: flex; align-items: center; gap: 15px; }
        .navbar .user-info span { font-size: 14px; }
        .btn-logout { background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .btn-logout:hover { background: rgba(255,255,255,0.3); }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-info h3 { font-size: 28px; color: #333; }
        .stat-info p { color: #888; font-size: 13px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab { padding: 10px 20px; background: white; border: 2px solid #e1e5e9; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; color: #555; transition: all 0.3s; }
        .tab.active { background: #667eea; color: white; border-color: #667eea; }
        .tab:hover { border-color: #667eea; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .card h2 { color: #333; margin-bottom: 20px; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        th { background: #f8f9fa; font-weight: 600; color: #555; }
        tr:hover { background: #f8f9ff; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-approved { background: #d4edda; color: #155724; }
        .badge-rejected { background: #f8d7da; color: #721c24; }
        .badge-new { background: #cce5ff; color: #004085; }
        .badge-reviewed { background: #e2e3f1; color: #383d6e; }
        .badge-interview { background: #fff3cd; color: #856404; }
        .badge-accepted { background: #d4edda; color: #155724; }
        .badge-scheduled { background: #cce5ff; color: #004085; }
        .badge-completed { background: #d4edda; color: #155724; }
        .badge-cancelled { background: #f8d7da; color: #721c24; }
        .btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a6fd6; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #218838; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        .btn-warning { background: #ffc107; color: #333; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
        .modal-overlay.active { display: flex; }
        .modal { background: white; border-radius: 16px; padding: 30px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
        .modal h2 { margin-bottom: 20px; color: #333; }
        .modal .form-group { margin-bottom: 16px; }
        .modal .form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #555; font-size: 14px; }
        .modal .form-group input, .modal .form-group textarea, .modal .form-group select { width: 100%; padding: 10px 14px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; }
        .modal .form-group textarea { height: 100px; resize: vertical; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .search-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-bar input, .search-bar select { padding: 10px 14px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px; }
        .search-bar input { flex: 1; min-width: 200px; }
        .empty-state { text-align: center; padding: 40px; color: #888; }
        .empty-state .icon { font-size: 48px; margin-bottom: 10px; }
        @media (max-width: 768px) { .navbar { flex-direction: column; gap: 10px; } .stats-grid { grid-template-columns: 1fr; } .tabs { flex-direction: column; } table { font-size: 12px; } th, td { padding: 8px; } }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🏢 Hệ thống Quản lý Tuyển dụng</h1>
        <div class="user-info">
            <span>👤 ${safeUser.fullName} (${user.role === 'admin' ? 'Quản trị' : user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'})</span>
            <button class="btn-logout" onclick="location.href='/logout'">Đăng xuất</button>
        </div>
    </div>
    <div class="container">
        <div class="stats-grid" id="statsGrid"></div>
        <div class="tabs" id="tabsContainer"></div>
        <div id="tabContents"></div>
    </div>
    <div class="modal-overlay" id="modalOverlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" id="modalContent"></div>
    </div>
    <script>
        const currentUser = ${JSON.stringify(user)};
        const isAdmin = currentUser.role === 'admin';
        const isEmployer = currentUser.role === 'employer';
        const isCandidate = currentUser.role === 'candidate';
        let jobs = [], applications = [], users = [], interviews = [];

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function apiCall(endpoint, method = 'GET', data = null) {
            try {
                const options = { method, headers: { 'Content-Type': 'application/json' } };
                if (data) options.body = JSON.stringify(data);
                const res = await fetch(endpoint, options);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Request failed: ' + res.status);
                }
                return res.json();
            } catch (e) {
                console.error('API call error:', endpoint, e);
                throw e;
            }
        }

        async function loadData() {
            try {
                [jobs, applications, interviews] = await Promise.all([
                    apiCall('/api/jobs'),
                    apiCall('/api/applications'),
                    apiCall('/api/interviews')
                ]);
                if (isAdmin) users = await apiCall('/api/users');

                jobs = Array.isArray(jobs) ? jobs : [];
                applications = Array.isArray(applications) ? applications : [];
                interviews = Array.isArray(interviews) ? interviews : [];
                users = Array.isArray(users) ? users : [];

                renderStats();
                renderTabs();
            } catch (e) {
                console.error('Load data error:', e);
                document.getElementById('tabContents').innerHTML =
                    '<div class="card"><div class="empty-state"><div class="icon">⚠️</div><p>Lỗi tải dữ liệu. Vui lòng thử lại.</p><button class="btn btn-primary" onclick="loadData()">Thử lại</button></div></div>';
            }
        }

        function getStatusText(status) {
            const statusMap = {
                'new': 'Mới',
                'reviewed': 'Đã xem',
                'interview': 'Phỏng vấn',
                'accepted': 'Chấp nhận',
                'rejected': 'Từ chối',
                'pending': 'Chờ duyệt',
                'approved': 'Đã duyệt',
                'scheduled': 'Đã lên lịch',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            };
            return statusMap[status] || status;
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function renderStats() {
            let stats = [];
            if (isAdmin) {
                stats = [
                    { icon: '👥', color: '#667eea', label: 'Tổng người dùng', value: users.length },
                    { icon: '💼', color: '#28a745', label: 'Tin tuyển dụng', value: jobs.length },
                    { icon: '📋', color: '#ffc107', label: 'Đơn ứng tuyển', value: applications.length },
                    { icon: '📅', color: '#dc3545', label: 'Lịch phỏng vấn', value: interviews.length }
                ];
            } else if (isEmployer) {
                const myJobs = jobs.filter(j => j.employerId === currentUser.id);
                const myApps = applications.filter(a => myJobs.some(j => j.id === a.jobId));
                stats = [
                    { icon: '💼', color: '#667eea', label: 'Tin đã đăng', value: myJobs.length },
                    { icon: '📋', color: '#28a745', label: 'Đơn nhận được', value: myApps.length },
                    { icon: '📅', color: '#ffc107', label: 'Lịch phỏng vấn', value: interviews.filter(i => i.employerId === currentUser.id).length },
                    { icon: '✅', color: '#dc3545', label: 'Đã tuyển', value: myApps.filter(a => a.status === 'accepted').length }
                ];
            } else {
                const myApps = applications.filter(a => a.candidateId === currentUser.id);
                stats = [
                    { icon: '📋', color: '#667eea', label: 'Đã ứng tuyển', value: myApps.length },
                    { icon: '📅', color: '#28a745', label: 'Lịch phỏng vấn', value: interviews.filter(i => i.candidateId === currentUser.id).length },
                    { icon: '✅', color: '#ffc107', label: 'Được chấp nhận', value: myApps.filter(a => a.status === 'accepted').length },
                    { icon: '💼', color: '#dc3545', label: 'Việc làm mở', value: jobs.filter(j => j.status === 'approved').length }
                ];
            }
            document.getElementById('statsGrid').innerHTML = stats.map(s =>
                '<div class="stat-card"><div class="stat-icon" style="background:' + s.color + '20;color:' + s.color + '">' + s.icon + '</div><div class="stat-info"><h3>' + s.value + '</h3><p>' + s.label + '</p></div></div>'
            ).join('');
        }

        function renderTabs() {
            let tabs = [];
            if (isAdmin) {
                tabs = ['Quản lý người dùng', 'Duyệt tin tuyển dụng', 'Tất cả đơn ứng tuyển', 'Lịch phỏng vấn'];
            } else if (isEmployer) {
                tabs = ['Tin tuyển dụng', 'Đơn ứng tuyển', 'Lịch phỏng vấn'];
            } else {
                tabs = ['Tìm việc làm', 'Đơn của tôi', 'Lịch phỏng vấn'];
            }
            document.getElementById('tabsContainer').innerHTML = tabs.map((t, i) =>
                '<div class="tab ' + (i === 0 ? 'active' : '') + '" onclick="switchTab(' + i + ')">' + t + '</div>'
            ).join('');
            renderTabContent(0);
        }

        function switchTab(index) {
            document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === index));
            renderTabContent(index);
        }

        function renderTabContent(index) {
            const container = document.getElementById('tabContents');
            if (isAdmin) {
                if (index === 0) renderUsersAdmin(container);
                else if (index === 1) renderJobsAdmin(container);
                else if (index === 2) renderApplicationsAdmin(container);
                else renderInterviewsAdmin(container);
            } else if (isEmployer) {
                if (index === 0) renderJobsEmployer(container);
                else if (index === 1) renderApplicationsEmployer(container);
                else renderInterviewsEmployer(container);
            } else {
                if (index === 0) renderJobsCandidate(container);
                else if (index === 1) renderApplicationsCandidate(container);
                else renderInterviewsCandidate(container);
            }
        }

        // ============ ADMIN RENDER FUNCTIONS ============
        function renderUsersAdmin(container) {
            container.innerHTML = '<div class="card"><h2>👥 Quản lý người dùng</h2>' +
                '<table><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>' +
                (users.length ? users.map(u =>
                    '<tr><td>' + escapeHtml(u.fullName) + '</td><td>' + escapeHtml(u.email) + '</td>' +
                    '<td><span class="badge ' + (u.role === 'admin' ? 'badge-approved' : u.role === 'employer' ? 'badge-new' : 'badge-pending') + '">' +
                    (u.role === 'admin' ? 'Admin' : u.role === 'employer' ? 'NTD' : 'Ứng viên') + '</span></td>' +
                    '<td>' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi') : 'N/A') + '</td>' +
                    '<td>' + (u.role !== 'admin' ? '<button class="btn btn-danger btn-sm" onclick="deleteUser(\\'' + u.id + '\\')">Xóa</button>' : '') + '</td></tr>'
                ).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">👥</div><p>Chưa có người dùng nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        function renderJobsAdmin(container) {
            container.innerHTML = '<div class="card"><h2>📋 Duyệt tin tuyển dụng</h2>' +
                '<table><thead><tr><th>Tiêu đề</th><th>Công ty</th><th>Lương</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' +
                (jobs.length ? jobs.map(j =>
                    '<tr><td>' + escapeHtml(j.title) + '</td><td>' + escapeHtml(j.company) + '</td>' +
                    '<td>' + escapeHtml(j.salary || 'Thỏa thuận') + '</td>' +
                    '<td><span class="badge badge-' + j.status + '">' + getStatusText(j.status) + '</span></td>' +
                    '<td>' + (j.status === 'pending' ?
                        '<button class="btn btn-success btn-sm" onclick="updateJobStatus(\\'' + j.id + '\\',\\'approved\\')">Duyệt</button> ' +
                        '<button class="btn btn-danger btn-sm" onclick="updateJobStatus(\\'' + j.id + '\\',\\'rejected\\')">Từ chối</button>' : '') + '</td></tr>'
                ).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div><p>Chưa có tin tuyển dụng nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        function renderApplicationsAdmin(container) {
            container.innerHTML = '<div class="card"><h2>📋 Tất cả đơn ứng tuyển</h2>' +
                '<table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Công ty</th><th>Trạng thái</th><th>Ngày nộp</th></tr></thead><tbody>' +
                (applications.length ? applications.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return '<tr><td>' + escapeHtml(a.candidateName) + '</td><td>' + escapeHtml(job.title || 'N/A') + '</td>' +
                        '<td>' + escapeHtml(job.company || 'N/A') + '</td>' +
                        '<td><span class="badge badge-' + a.status + '">' + getStatusText(a.status) + '</span></td>' +
                        '<td>' + (a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi') : 'N/A') + '</td></tr>';
                }).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div><p>Chưa có đơn ứng tuyển nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        function renderInterviewsAdmin(container) {
            container.innerHTML = '<div class="card"><h2>📅 Lịch phỏng vấn</h2>' +
                '<table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Thời gian</th><th>Hình thức</th><th>Trạng thái</th></tr></thead><tbody>' +
                (interviews.length ? interviews.map(i =>
                    '<tr><td>' + escapeHtml(i.candidateName) + '</td><td>' + escapeHtml(i.jobTitle) + '</td>' +
                    '<td>' + (i.dateTime ? new Date(i.dateTime).toLocaleString('vi') : 'N/A') + '</td>' +
                    '<td>' + escapeHtml(i.type || 'Trực tiếp') + '</td>' +
                    '<td><span class="badge badge-' + i.status + '">' + getStatusText(i.status) + '</span></td></tr>'
                ).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>Chưa có lịch phỏng vấn nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        // ============ EMPLOYER RENDER FUNCTIONS ============
        function renderJobsEmployer(container) {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            container.innerHTML = '<div class="card"><h2>💼 Tin tuyển dụng của tôi ' +
                '<button class="btn btn-primary" style="float:right" onclick="showCreateJobModal()">+ Đăng tin mới</button></h2>' +
                '<table><thead><tr><th>Tiêu đề</th><th>Lương</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' +
                (myJobs.length ? myJobs.map(j =>
                    '<tr><td>' + escapeHtml(j.title) + '</td><td>' + escapeHtml(j.salary || 'Thỏa thuận') + '</td>' +
                    '<td>' + escapeHtml(j.location || 'N/A') + '</td>' +
                    '<td><span class="badge badge-' + j.status + '">' + getStatusText(j.status) + '</span></td>' +
                    '<td><button class="btn btn-danger btn-sm" onclick="deleteJob(\\'' + j.id + '\\')">Xóa</button></td></tr>'
                ).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">💼</div><p>Chưa có tin tuyển dụng nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        function renderApplicationsEmployer(container) {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            const myApps = applications.filter(a => myJobs.some(j => j.id === a.jobId));
            container.innerHTML = '<div class="card"><h2>📋 Đơn ứng tuyển nhận được</h2>' +
                '<table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' +
                (myApps.length ? myApps.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return '<tr><td>' + escapeHtml(a.candidateName) + '</td><td>' + escapeHtml(job.title || 'N/A') + '</td>' +
                        '<td>' + escapeHtml(a.candidateEmail || 'N/A') + '</td>' +
                        '<td><span class="badge badge-' + a.status + '">' + getStatusText(a.status) + '</span></td>' +
                        '<td>' + (a.status === 'new' || a.status === 'reviewed' ?
                            '<button class="btn btn-success btn-sm" onclick="updateAppStatus(\\'' + a.id + '\\',\\'interview\\')">Phỏng vấn</button> ' +
                            '<button class="btn btn-primary btn-sm" onclick="updateAppStatus(\\'' + a.id + '\\',\\'accepted\\')">Nhận</button> ' +
                            '<button class="btn btn-danger btn-sm" onclick="updateAppStatus(\\'' + a.id + '\\',\\'rejected\\')">Từ chối</button>' : '') + '</td></tr>';
                }).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div><p>Chưa có đơn ứng tuyển nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        // ============ EMPLOYER: INTERVIEWS ============
        function renderInterviewsEmployer(container) {
            const myInterviews = interviews.filter(i => i.employerId === currentUser.id);
            container.innerHTML = '<div class="card"><h2>📅 Lịch phỏng vấn ' +
                '<button class="btn btn-primary" style="float:right" onclick="showCreateInterviewModal()">+ Tạo lịch</button></h2>' +
                '<table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Thời gian</th><th>Địa điểm</th><th>Trạng thái</th></tr></thead><tbody>' +
                (myInterviews.length ? myInterviews.map(i =>
                    '<tr><td>' + escapeHtml(i.candidateName) + '</td>' +
                    '<td>' + escapeHtml(i.jobTitle) + '</td>' +
                    '<td>' + (i.dateTime ? new Date(i.dateTime).toLocaleString('vi') : 'N/A') + '</td>' +
                    '<td>' + escapeHtml(i.location || 'N/A') + '</td>' +
                    '<td><span class="badge badge-' + i.status + '">' + getStatusText(i.status) + '</span></td></tr>'
                ).join('') :
                '<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>Chưa có lịch phỏng vấn nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        // ============ CANDIDATE: JOBS ============
        function renderJobsCandidate(container) {
            const approvedJobs = jobs.filter(j => j.status === 'approved');
            container.innerHTML = '<div class="card"><h2>💼 Việc làm đang tuyển</h2>' +
                '<div class="search-bar"><input type="text" placeholder="Tìm kiếm việc làm..." onkeyup="filterJobs(this.value)"></div>' +
                '<div id="jobsList">' +
                (approvedJobs.length ? approvedJobs.map(j => {
                    const alreadyApplied = applications.some(a => a.jobId === j.id && a.candidateId === currentUser.id);
                    return '<div class="job-item" style="border:1px solid #e1e5e9;border-radius:12px;padding:16px;margin-bottom:12px;">' +
                        '<h3 style="color:#333;margin-bottom:8px;">' + escapeHtml(j.title) + '</h3>' +
                        '<p style="color:#666;margin-bottom:4px;">🏢 ' + escapeHtml(j.company) +
                        ' | 📍 ' + escapeHtml(j.location || 'N/A') +
                        ' | 💰 ' + escapeHtml(j.salary || 'Thỏa thuận') + '</p>' +
                        '<p style="color:#888;font-size:13px;margin-bottom:12px;">' +
                        (j.description ? escapeHtml(j.description.substring(0, 150)) + '...' : '') + '</p>' +
                        (alreadyApplied ?
                            '<span class="badge badge-approved">Đã ứng tuyển</span>' :
                            '<button class="btn btn-primary btn-sm" onclick="applyJob(\\'' + j.id + '\\',\\'' + escapeHtml(j.title).replace(/'/g, "\\\\'") + '\\')">Ứng tuyển ngay</button>') +
                        '</div>';
                }).join('') :
                '<div class="empty-state"><div class="icon">💼</div><p>Chưa có việc làm nào</p></div>') +
                '</div></div>';
        }

        // ============ CANDIDATE: APPLICATIONS ============
        function renderApplicationsCandidate(container) {
            const myApps = applications.filter(a => a.candidateId === currentUser.id);
            container.innerHTML = '<div class="card"><h2>📋 Đơn ứng tuyển của tôi</h2>' +
                '<table><thead><tr><th>Vị trí</th><th>Công ty</th><th>Ngày nộp</th><th>Trạng thái</th></tr></thead><tbody>' +
                (myApps.length ? myApps.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return '<tr><td>' + escapeHtml(job.title || 'N/A') + '</td>' +
                        '<td>' + escapeHtml(job.company || 'N/A') + '</td>' +
                        '<td>' + (a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi') : 'N/A') + '</td>' +
                        '<td><span class="badge badge-' + a.status + '">' + getStatusText(a.status) + '</span></td></tr>';
                }).join('') :
                '<tr><td colspan="4"><div class="empty-state"><div class="icon">📋</div><p>Bạn chưa ứng tuyển việc nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        // ============ CANDIDATE: INTERVIEWS ============
        function renderInterviewsCandidate(container) {
            const myInterviews = interviews.filter(i => i.candidateId === currentUser.id);
            container.innerHTML = '<div class="card"><h2>📅 Lịch phỏng vấn của tôi</h2>' +
                '<table><thead><tr><th>Vị trí</th><th>Công ty</th><th>Thời gian</th><th>Địa điểm</th><th>Trạng thái</th></tr></thead><tbody>' +
                (myInterviews.length ? myInterviews.map(i =>
                    '<tr><td>' + escapeHtml(i.jobTitle) + '</td>' +
                    '<td>' + escapeHtml(i.company || 'N/A') + '</td>' +
                    '<td>' + (i.dateTime ? new Date(i.dateTime).toLocaleString('vi') : 'N/A') + '</td>' +
                    '<td>' + escapeHtml(i.location || 'N/A') + '</td>' +
                    '<td><span class="badge badge-' + i.status + '">' + getStatusText(i.status) + '</span></td></tr>'
                ).join('') :
                '<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>Chưa có lịch phỏng vấn nào</p></div></td></tr>') +
                '</tbody></table></div>';
        }

        function filterJobs(keyword) {
            const kw = keyword.toLowerCase();
            const items = document.querySelectorAll('.job-item');
            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(kw) ? '' : 'none';
            });
        }

        // ============ MODAL FUNCTIONS ============
        function showModal(html) {
            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('modalOverlay').classList.add('active');
        }

        // ============ CREATE JOB MODAL ============
        function showCreateJobModal() {
            showModal(
                '<h2>📝 Đăng tin tuyển dụng mới</h2>' +
                '<div class="form-group"><label>Tiêu đề công việc <span style="color:red">*</span></label><input type="text" id="jobTitle" required></div>' +
                '<div class="form-group"><label>Tên công ty <span style="color:red">*</span></label><input type="text" id="jobCompany" required></div>' +
                '<div class="form-group"><label>Địa điểm</label><input type="text" id="jobLocation"></div>' +
                '<div class="form-group"><label>Mức lương</label><input type="text" id="jobSalary" placeholder="VD: 15-25 triệu"></div>' +
                '<div class="form-group"><label>Mô tả công việc</label><textarea id="jobDescription"></textarea></div>' +
                '<div class="form-group"><label>Yêu cầu</label><textarea id="jobRequirements"></textarea></div>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-danger" onclick="closeModal()">Hủy</button>' +
                    '<button class="btn btn-primary" onclick="createJob()">Đăng tin</button>' +
                '</div>'
            );
        }

        // ============ CREATE INTERVIEW MODAL ============
        function showCreateInterviewModal() {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            const myApps = applications.filter(a =>
                myJobs.some(j => j.id === a.jobId) &&
                (a.status === 'interview' || a.status === 'new' || a.status === 'reviewed')
            );

            if (!myApps.length) {
                showModal(
                    '<h2>📅 Tạo lịch phỏng vấn</h2>' +
                    '<div class="empty-state"><div class="icon">📋</div>' +
                    '<p>Chưa có ứng viên nào để lên lịch phỏng vấn.</p></div>' +
                    '<div class="modal-actions"><button class="btn btn-danger" onclick="closeModal()">Đóng</button></div>'
                );
                return;
            }

            var optionsHtml = myApps.map(a => {
                const job = jobs.find(j => j.id === a.jobId) || {};
                return '<option value="' + a.id + '"' +
                    ' data-candidate="' + escapeHtml(a.candidateName) + '"' +
                    ' data-candidateid="' + a.candidateId + '"' +
                    ' data-job="' + escapeHtml(job.title || '') + '"' +
                    ' data-jobid="' + a.jobId + '">' +
                    escapeHtml(a.candidateName) + ' - ' + escapeHtml(job.title || 'N/A') + '</option>';
            }).join('');

            showModal(
                '<h2>📅 Tạo lịch phỏng vấn</h2>' +
                '<div class="form-group"><label>Chọn ứng viên <span style="color:red">*</span></label>' +
                    '<select id="interviewApp">' + optionsHtml + '</select></div>' +
                '<div class="form-group"><label>Thời gian <span style="color:red">*</span></label><input type="datetime-local" id="interviewDate"></div>' +
                '<div class="form-group"><label>Địa điểm / Link meeting</label><input type="text" id="interviewLocation"></div>' +
                '<div class="form-group"><label>Hình thức</label>' +
                    '<select id="interviewType"><option value="Trực tiếp">Trực tiếp</option><option value="Online">Online</option></select></div>' +
                '<div class="form-group"><label>Ghi chú</label><textarea id="interviewNote"></textarea></div>' +
                '<div class="modal-actions">' +
                    '<button class="btn btn-danger" onclick="closeModal()">Hủy</button>' +
                    '<button class="btn btn-primary" onclick="createInterview()">Tạo lịch</button>' +
                '</div>'
            );
        }

        // ============ API ACTION FUNCTIONS ============
        async function createJob() {
            const title = document.getElementById('jobTitle').value.trim();
            const company = document.getElementById('jobCompany').value.trim();

            if (!title || !company) {
                alert('Vui lòng nhập đầy đủ tiêu đề và tên công ty!');
                return;
            }

            const job = {
                title: title,
                company: company,
                location: document.getElementById('jobLocation').value.trim(),
                salary: document.getElementById('jobSalary').value.trim(),
                description: document.getElementById('jobDescription').value.trim(),
                requirements: document.getElementById('jobRequirements').value.trim(),
                employerId: currentUser.id,
                employerName: currentUser.fullName,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            try {
                await apiCall('/api/jobs', 'POST', job);
                closeModal();
                loadData();
            } catch (e) {
                alert('Lỗi khi đăng tin: ' + e.message);
            }
        }

        async function createInterview() {
            const select = document.getElementById('interviewApp');
            if (!select || !select.value) {
                alert('Vui lòng chọn ứng viên!');
                return;
            }

            const dateTime = document.getElementById('interviewDate').value;
            if (!dateTime) {
                alert('Vui lòng chọn thời gian!');
                return;
            }

            const option = select.options[select.selectedIndex];
            const interview = {
                applicationId: select.value,
                candidateName: option.dataset.candidate,
                candidateId: option.dataset.candidateid,
                jobTitle: option.dataset.job,
                jobId: option.dataset.jobid,
                employerId: currentUser.id,
                dateTime: dateTime,
                location: document.getElementById('interviewLocation').value.trim(),
                type: document.getElementById('interviewType').value,
                note: document.getElementById('interviewNote').value.trim(),
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };

            try {
                await apiCall('/api/interviews', 'POST', interview);
                await apiCall('/api/applications/' + select.value, 'PUT', { status: 'interview' });
                closeModal();
                loadData();
            } catch (e) {
                alert('Lỗi khi tạo lịch phỏng vấn: ' + e.message);
            }
        }

        async function applyJob(jobId, jobTitle) {
            if (!confirm('Bạn muốn ứng tuyển vị trí "' + jobTitle + '"?')) return;

            const application = {
                jobId: jobId,
                candidateId: currentUser.id,
                candidateName: currentUser.fullName,
                candidateEmail: currentUser.email,
                status: 'new',
                createdAt: new Date().toISOString()
            };

            try {
                await apiCall('/api/applications', 'POST', application);
                loadData();
            } catch (e) {
                alert('Lỗi khi ứng tuyển: ' + e.message);
            }
        }

        async function updateJobStatus(jobId, status) {
            try {
                await apiCall('/api/jobs/' + jobId, 'PUT', { status: status });
                loadData();
            } catch (e) {
                alert('Lỗi: ' + e.message);
            }
        }

        async function updateAppStatus(appId, status) {
            try {
                await apiCall('/api/applications/' + appId, 'PUT', { status: status });
                loadData();
            } catch (e) {
                alert('Lỗi: ' + e.message);
            }
        }

        async function deleteJob(jobId) {
            if (!confirm('Xác nhận xóa tin tuyển dụng này?')) return;
            try {
                await apiCall('/api/jobs/' + jobId, 'DELETE');
                loadData();
            } catch (e) {
                alert('Lỗi: ' + e.message);
            }
        }

        async function deleteUser(userId) {
            if (!confirm('Xác nhận xóa người dùng này?')) return;
            try {
                await apiCall('/api/users/' + userId, 'DELETE');
                loadData();
            } catch (e) {
                alert('Lỗi: ' + e.message);
            }
        }

        // Load data khi trang được tải
        loadData();
    </script>
</body>
</html>`;
}
        // ============ INIT ============
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        // Load dữ liệu khi trang sẵn sàng
        loadData();
    </script>
</body>
</html>`;
}

// ============ PARSE FORM BODY ============
function parseFormBody(body) {
    const params = {};
    body.split('&').forEach(pair => {
        const [key, ...valueParts] = pair.split('=');
        if (key) {
            try {
                params[decodeURIComponent(key)] = decodeURIComponent(valueParts.join('=').replace(/\+/g, ' '));
            } catch (e) {
                params[key] = valueParts.join('=');
            }
        }
    });
    return params;
}

// ============ SIMPLE SESSION STORE ============
const sessions = {};

function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

function getSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies['sessionId'];
    if (sessionId && sessions[sessionId]) {
        return sessions[sessionId];
    }
    return null;
}

function createSession(res, userData) {
    const sessionId = generateSessionId();
    sessions[sessionId] = userData;
    res.setHeader('Set-Cookie', `sessionId=${encodeURIComponent(sessionId)}; Path=/; HttpOnly`);
    return sessionId;
}

function destroySession(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies['sessionId'];
    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }
    res.setHeader('Set-Cookie', 'sessionId=; Path=/; HttpOnly; Max-Age=0');
}

// ============ SIMPLE PASSWORD HASH (for demo) ============
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(36);
}

// ============ SEND JSON RESPONSE ============
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

// ============ SEND HTML RESPONSE ============
function sendHTML(res, statusCode, html) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
}

// ============ REDIRECT ============
function redirect(res, location) {
    res.writeHead(302, { 'Location': location });
    res.end();
}

// ============ READ REQUEST BODY ============
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            // Giới hạn body size 1MB để tránh abuse
            if (body.length > 1024 * 1024) {
                req.destroy();
                reject(new Error('Body too large'));
            }
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

// ============ INIT ADMIN ACCOUNT ============
async function initAdmin() {
    try {
        const users = await firebaseRequest('users', 'GET');
        if (!users) {
            // Tạo tài khoản admin mặc định
            const adminData = {
                fullName: 'Administrator',
                email: 'admin@admin.com',
                password: simpleHash('admin123'),
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            await firebaseRequest('users', 'POST', adminData);
            console.log('Admin account created: admin@admin.com / admin123');
        }
    } catch (e) {
        console.error('Init admin error:', e.message);
    }
}

// ============ HTTP SERVER ============
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    try {
        // ========== STATIC PAGES ==========

        // GET / - Trang chủ (redirect theo trạng thái login)
        if (method === 'GET' && pathname === '/') {
            const session = getSession(req);
            if (session) {
                sendHTML(res, 200, getDashboardPage(session));
            } else {
                sendHTML(res, 200, getLoginPage());
            }
            return;
        }

        // GET /login - Trang đăng nhập
        if (method === 'GET' && pathname === '/login') {
            const session = getSession(req);
            if (session) {
                redirect(res, '/');
                return;
            }
            sendHTML(res, 200, getLoginPage());
            return;
        }

        // POST /login - Xử lý đăng nhập
        if (method === 'POST' && pathname === '/login') {
            const body = await readBody(req);
            const params = parseFormBody(body);
            const { email, password } = params;

            if (!email || !password) {
                sendHTML(res, 200, getLoginPage('Vui lòng nhập đầy đủ email và mật khẩu'));
                return;
            }

            try {
                const usersData = await firebaseRequest('users', 'GET');
                if (!usersData) {
                    sendHTML(res, 200, getLoginPage('Tài khoản không tồn tại'));
                    return;
                }

                const hashedPassword = simpleHash(password);
                let foundUser = null;
                let userId = null;

                for (const [id, user] of Object.entries(usersData)) {
                    if (user.email === email && user.password === hashedPassword) {
                        foundUser = user;
                        userId = id;
                        break;
                    }
                }

                if (!foundUser) {
                    sendHTML(res, 200, getLoginPage('Email hoặc mật khẩu không đúng'));
                    return;
                }

                const sessionData = {
                    id: userId,
                    fullName: foundUser.fullName,
                    email: foundUser.email,
                    role: foundUser.role
                };

                createSession(res, sessionData);
                redirect(res, '/');
            } catch (e) {
                console.error('Login error:', e.message);
                sendHTML(res, 200, getLoginPage('Lỗi hệ thống, vui lòng thử lại'));
            }
            return;
        }

        // POST /register - Xử lý đăng ký
        if (method === 'POST' && pathname === '/register') {
            const body = await readBody(req);
            const params = parseFormBody(body);
            const { fullName, email, password, role } = params;

            if (!fullName || !email || !password) {
                sendHTML(res, 200, getLoginPage('Vui lòng nhập đầy đủ thông tin'));
                return;
            }

            if (password.length < 6) {
                sendHTML(res, 200, getLoginPage('Mật khẩu phải có ít nhất 6 ký tự'));
                return;
            }

            const validRoles = ['candidate', 'employer'];
            const userRole = validRoles.includes(role) ? role : 'candidate';

            try {
                // Kiểm tra email đã tồn tại
                const usersData = await firebaseRequest('users', 'GET');
                if (usersData) {
                    for (const [id, user] of Object.entries(usersData)) {
                        if (user.email === email) {
                            sendHTML(res, 200, getLoginPage('Email đã được sử dụng'));
                            return;
                        }
                    }
                }

                const newUser = {
                    fullName: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    password: simpleHash(password),
                    role: userRole,
                    createdAt: new Date().toISOString()
                };

                await firebaseRequest('users', 'POST', newUser);
                sendHTML(res, 200, getLoginPage('', 'Đăng ký thành công! Vui lòng đăng nhập.'));
            } catch (e) {
                console.error('Register error:', e.message);
                sendHTML(res, 200, getLoginPage('Lỗi hệ thống, vui lòng thử lại'));
            }
            return;
        }

        // GET /logout - Đăng xuất
        if (method === 'GET' && pathname === '/logout') {
            destroySession(req, res);
            redirect(res, '/login');
            return;
        }

        // ========== API ROUTES ==========

        // Kiểm tra đăng nhập cho tất cả API
        const session = getSession(req);
        if (!session && pathname.startsWith('/api/')) {
            sendJSON(res, 401, { error: 'Unauthorized' });
            return;
        }

        // GET /api/jobs - Lấy danh sách việc làm
        if (method === 'GET' && pathname === '/api/jobs') {
            try {
                const data = await firebaseRequest('jobs', 'GET');
                const jobs = [];
                if (data) {
                    for (const [id, job] of Object.entries(data)) {
                        jobs.push({ id, ...job });
                    }
                }
                sendJSON(res, 200, jobs);
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // POST /api/jobs - Tạo việc làm mới
        if (method === 'POST' && pathname === '/api/jobs') {
            try {
                const body = await readBody(req);
                const jobData = JSON.parse(body);
                const result = await firebaseRequest('jobs', 'POST', jobData);
                sendJSON(res, 201, { id: result.name, ...jobData });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // PUT /api/jobs/:id - Cập nhật việc làm
        if (method === 'PUT' && pathname.startsWith('/api/jobs/')) {
            const jobId = pathname.split('/api/jobs/')[1];
            if (!jobId) {
                sendJSON(res, 400, { error: 'Missing job ID' });
                return;
            }
            try {
                const body = await readBody(req);
                const updateData = JSON.parse(body);
                await firebaseRequest(`jobs/${jobId}`, 'PATCH', updateData);
                sendJSON(res, 200, { success: true });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // DELETE /api/jobs/:id - Xóa việc làm
        if (method === 'DELETE' && pathname.startsWith('/api/jobs/')) {
            const jobId = pathname.split('/api/jobs/')[1];
            if (!jobId) {
                sendJSON(res, 400, { error: 'Missing job ID' });
                return;
            }
            try {
                await firebaseRequest(`jobs/${jobId}`, 'DELETE');
                sendJSON(res, 200, { success: true });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // GET /api/applications - Lấy danh sách đơn ứng tuyển
        if (method === 'GET' && pathname === '/api/applications') {
            try {
                const data = await firebaseRequest('applications', 'GET');
                const applications = [];
                if (data) {
                    for (const [id, app] of Object.entries(data)) {
                        applications.push({ id, ...app });
                    }
                }
                sendJSON(res, 200, applications);
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // POST /api/applications - Tạo đơn ứng tuyển
        if (method === 'POST' && pathname === '/api/applications') {
            try {
                const body = await readBody(req);
                const appData = JSON.parse(body);
                const result = await firebaseRequest('applications', 'POST', appData);
                sendJSON(res, 201, { id: result.name, ...appData });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // PUT /api/applications/:id - Cập nhật đơn ứng tuyển
        if (method === 'PUT' && pathname.startsWith('/api/applications/')) {
            const appId = pathname.split('/api/applications/')[1];
            if (!appId) {
                sendJSON(res, 400, { error: 'Missing application ID' });
                return;
            }
            try {
                const body = await readBody(req);
                const updateData = JSON.parse(body);
                await firebaseRequest(`applications/${appId}`, 'PATCH', updateData);
                sendJSON(res, 200, { success: true });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // GET /api/interviews - Lấy danh sách phỏng vấn
        if (method === 'GET' && pathname === '/api/interviews') {
            try {
                const data = await firebaseRequest('interviews', 'GET');
                const interviews = [];
                if (data) {
                    for (const [id, interview] of Object.entries(data)) {
                        interviews.push({ id, ...interview });
                    }
                }
                sendJSON(res, 200, interviews);
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // POST /api/interviews - Tạo lịch phỏng vấn
        if (method === 'POST' && pathname === '/api/interviews') {
            try {
                const body = await readBody(req);
                const interviewData = JSON.parse(body);
                const result = await firebaseRequest('interviews', 'POST', interviewData);
                sendJSON(res, 201, { id: result.name, ...interviewData });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // GET /api/users - Lấy danh sách người dùng (admin only)
        if (method === 'GET' && pathname === '/api/users') {
            if (session.role !== 'admin') {
                sendJSON(res, 403, { error: 'Forbidden' });
                return;
            }
            try {
                const data = await firebaseRequest('users', 'GET');
                const users = [];
                if (data) {
                    for (const [id, user] of Object.entries(data)) {
                        // Không trả về password
                        const { password, ...safeUser } = user;
                        users.push({ id, ...safeUser });
                    }
                }
                sendJSON(res, 200, users);
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // DELETE /api/users/:id - Xóa người dùng (admin only)
        if (method === 'DELETE' && pathname.startsWith('/api/users/')) {
            if (session.role !== 'admin') {
                sendJSON(res, 403, { error: 'Forbidden' });
                return;
            }
            const userId = pathname.split('/api/users/')[1];
            if (!userId) {
                sendJSON(res, 400, { error: 'Missing user ID' });
                return;
            }
            try {
                await firebaseRequest(`users/${userId}`, 'DELETE');
                sendJSON(res, 200, { success: true });
            } catch (e) {
                sendJSON(res, 500, { error: e.message });
            }
            return;
        }

        // ========== 404 ==========
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Không tìm thấy trang</h1><a href="/">Về trang chủ</a>');

    } catch (e) {
        console.error('Server error:', e.message);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>500 - Lỗi server</h1>');
    }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;

initAdmin().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server đang chạy tại http://localhost:${PORT}`);
        console.log('Admin mặc định: admin@admin.com / admin123');
    });
}).catch(e => {
    console.error('Init error:', e.message);
    // Vẫn start server dù init admin thất bại
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
});