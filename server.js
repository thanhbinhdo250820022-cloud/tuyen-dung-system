const http = require('http');
const https = require('https');
const url = require('url');

const DATABASE_URL = 'https://quan-ly-tuyen-dung-default-rtdb.asia-southeast1.firebasedatabase.app/';

function firebaseRequest(path, method, data) {
    return new Promise((resolve, reject) => {
        const firebaseUrl = `${DATABASE_URL}${path}.json`;
        const parsedUrl = url.parse(firebaseUrl);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { resolve(body); }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) cookies[name] = decodeURIComponent(value);
        });
    }
    return cookies;
}

function getLoginPage(error = '', success = '') {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng nhập - Hệ thống Quản lý Tuyển dụng</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .login-container {
            background: white; border-radius: 20px; padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 100%; max-width: 420px;
        }
        .login-header { text-align: center; margin-bottom: 30px; }
        .login-header h1 { color: #333; font-size: 24px; margin-bottom: 8px; }
        .login-header p { color: #666; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 6px; color: #555; font-weight: 600; font-size: 14px; }
        .form-group input, .form-group select {
            width: 100%; padding: 12px 16px; border: 2px solid #e1e5e9;
            border-radius: 10px; font-size: 14px; transition: all 0.3s;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }
        .btn-login {
            width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; border: none; border-radius: 10px; font-size: 16px;
            font-weight: 600; cursor: pointer; transition: transform 0.2s;
        }
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
        ${error ? `<div class="error">${error}</div>` : ''}
        ${success ? `<div class="success">${success}</div>` : ''}
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
            <a href="#" id="toggleLink" onclick="toggleForm()">Đăng ký ngay</a>
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

function getDashboardPage(user) {
    const isAdmin = user.role === 'admin';
    const isEmployer = user.role === 'employer';
    const isCandidate = user.role === 'candidate';

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Hệ thống Quản lý Tuyển dụng</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; }
        .navbar {
            background: linear-gradient(135deg, #667eea, #764ba2); color: white;
            padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .navbar h1 { font-size: 20px; }
        .navbar .user-info { display: flex; align-items: center; gap: 15px; }
        .navbar .user-info span { font-size: 14px; }
        .btn-logout {
            background: rgba(255,255,255,0.2); color: white; border: none;
            padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .btn-logout:hover { background: rgba(255,255,255,0.3); }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card {
            background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 16px;
        }
        .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .stat-info h3 { font-size: 28px; color: #333; }
        .stat-info p { color: #888; font-size: 13px; }
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .tab {
            padding: 10px 20px; background: white; border: 2px solid #e1e5e9;
            border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; color: #555;
            transition: all 0.3s;
        }
        .tab.active { background: #667eea; color: white; border-color: #667eea; }
        .tab:hover { border-color: #667eea; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .card {
            background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px;
        }
        .card h2 { color: #333; margin-bottom: 20px; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        th { background: #f8f9fa; font-weight: 600; color: #555; }
        tr:hover { background: #f8f9ff; }
        .badge {
            padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-approved { background: #d4edda; color: #155724; }
        .badge-rejected { background: #f8d7da; color: #721c24; }
        .badge-new { background: #cce5ff; color: #004085; }
        .badge-reviewed { background: #e2e3f1; color: #383d6e; }
        .badge-interview { background: #fff3cd; color: #856404; }
        .badge-accepted { background: #d4edda; color: #155724; }
        .btn {
            padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer;
            font-size: 13px; font-weight: 600; transition: all 0.2s;
        }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5a6fd6; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #218838; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        .btn-warning { background: #ffc107; color: #333; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }
        .modal-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;
        }
        .modal-overlay.active { display: flex; }
        .modal {
            background: white; border-radius: 16px; padding: 30px; width: 90%; max-width: 500px;
            max-height: 80vh; overflow-y: auto;
        }
        .modal h2 { margin-bottom: 20px; color: #333; }
        .modal .form-group { margin-bottom: 16px; }
        .modal .form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #555; font-size: 14px; }
        .modal .form-group input, .modal .form-group textarea, .modal .form-group select {
            width: 100%; padding: 10px 14px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px;
        }
        .modal .form-group textarea { height: 100px; resize: vertical; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
        .search-bar {
            display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .search-bar input, .search-bar select {
            padding: 10px 14px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 14px;
        }
        .search-bar input { flex: 1; min-width: 200px; }
        .empty-state { text-align: center; padding: 40px; color: #888; }
        .empty-state .icon { font-size: 48px; margin-bottom: 10px; }
        @media (max-width: 768px) {
            .navbar { flex-direction: column; gap: 10px; }
            .stats-grid { grid-template-columns: 1fr; }
            .tabs { flex-direction: column; }
            table { font-size: 12px; }
            th, td { padding: 8px; }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🏢 Hệ thống Quản lý Tuyển dụng</h1>
        <div class="user-info">
            <span>👤 ${user.fullName} (${user.role === 'admin' ? 'Quản trị' : user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'})</span>
            <button class="btn-logout" onclick="location.href='/logout'">Đăng xuất</button>
        </div>
    </div>
    <div class="container">
        <div class="stats-grid" id="statsGrid"></div>
        <div class="tabs" id="tabsContainer"></div>
        <div id="tabContents"></div>
    </div>

    <div class="modal-overlay" id="modalOverlay">
        <div class="modal" id="modalContent"></div>
    </div>

    <script>
        const currentUser = ${JSON.stringify(user)};
        const isAdmin = currentUser.role === 'admin';
        const isEmployer = currentUser.role === 'employer';
        const isCandidate = currentUser.role === 'candidate';

        let jobs = [], applications = [], users = [], interviews = [];

        async function apiCall(endpoint, method = 'GET', data = null) {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (data) options.body = JSON.stringify(data);
            const res = await fetch(endpoint, options);
            return res.json();
        }

        async function loadData() {
            try {
                jobs = await apiCall('/api/jobs');
                applications = await apiCall('/api/applications');
                if (isAdmin) users = await apiCall('/api/users');
                interviews = await apiCall('/api/interviews');
                renderStats();
                renderTabs();
            } catch (e) { console.error('Load data error:', e); }
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
            document.getElementById('statsGrid').innerHTML = stats.map(s => `
                <div class="stat-card">
                    <div class="stat-icon" style="background:${s.color}20;color:${s.color}">${s.icon}</div>
                    <div class="stat-info"><h3>${s.value}</h3><p>${s.label}</p></div>
                </div>
            `).join('');
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
                \`<div class="tab \${i === 0 ? 'active' : ''}" onclick="switchTab(\${i})">\${t}</div>\`
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

        // ADMIN FUNCTIONS
        function renderUsersAdmin(container) {
            container.innerHTML = \`<div class="card"><h2>👥 Quản lý người dùng</h2>
                <table><thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
                <tbody>\${users.map(u => \`<tr><td>\${u.fullName}</td><td>\${u.email}</td>
                    <td><span class="badge \${u.role === 'admin' ? 'badge-approved' : u.role === 'employer' ? 'badge-new' : 'badge-pending'}">\${u.role === 'admin' ? 'Admin' : u.role === 'employer' ? 'NTD' : 'Ứng viên'}</span></td>
                    <td>\${new Date(u.createdAt).toLocaleDateString('vi')}</td>
                    <td>\${u.role !== 'admin' ? \`<button class="btn btn-danger btn-sm" onclick="deleteUser('\${u.id}')">Xóa</button>\` : ''}</td></tr>\`).join('')}</tbody></table></div>\`;
        }

        function renderJobsAdmin(container) {
            container.innerHTML = \`<div class="card"><h2>📋 Duyệt tin tuyển dụng</h2>
                <table><thead><tr><th>Tiêu đề</th><th>Công ty</th><th>Lương</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>\${jobs.map(j => \`<tr><td>\${j.title}</td><td>\${j.company}</td><td>\${j.salary || 'Thỏa thuận'}</td>
                    <td><span class="badge badge-\${j.status}">\${j.status === 'pending' ? 'Chờ duyệt' : j.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></td>
                    <td>\${j.status === 'pending' ? \`<button class="btn btn-success btn-sm" onclick="updateJobStatus('\${j.id}','approved')">Duyệt</button>
                        <button class="btn btn-danger btn-sm" onclick="updateJobStatus('\${j.id}','rejected')">Từ chối</button>\` : ''}</td></tr>\`).join('')}</tbody></table></div>\`;
        }

        function renderApplicationsAdmin(container) {
            container.innerHTML = \`<div class="card"><h2>📋 Tất cả đơn ứng tuyển</h2>
                <table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Công ty</th><th>Trạng thái</th><th>Ngày nộp</th></tr></thead>
                <tbody>\${applications.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return \`<tr><td>\${a.candidateName}</td><td>\${job.title || 'N/A'}</td><td>\${job.company || 'N/A'}</td>
                        <td><span class="badge badge-\${a.status}">\${getStatusText(a.status)}</span></td>
                        <td>\${new Date(a.createdAt).toLocaleDateString('vi')}</td></tr>\`;
                }).join('')}</tbody></table></div>\`;
        }

        function renderInterviewsAdmin(container) {
            container.innerHTML = \`<div class="card"><h2>📅 Lịch phỏng vấn</h2>
                <table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Thời gian</th><th>Hình thức</th><th>Trạng thái</th></tr></thead>
                <tbody>\${interviews.map(i => \`<tr><td>\${i.candidateName}</td><td>\${i.jobTitle}</td>
                    <td>\${new Date(i.dateTime).toLocaleString('vi')}</td><td>\${i.type || 'Trực tiếp'}</td>
                    <td><span class="badge badge-\${i.status}">\${i.status === 'scheduled' ? 'Đã lên lịch' : i.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}</span></td></tr>\`).join('')}</tbody></table></div>\`;
        }

        // EMPLOYER FUNCTIONS
        function renderJobsEmployer(container) {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            container.innerHTML = \`<div class="card"><h2>💼 Tin tuyển dụng của tôi
                <button class="btn btn-primary" style="float:right" onclick="showCreateJobModal()">+ Đăng tin mới</button></h2>
                <table><thead><tr><th>Tiêu đề</th><th>Lương</th><th>Địa điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>\${myJobs.length ? myJobs.map(j => \`<tr><td>\${j.title}</td><td>\${j.salary || 'Thỏa thuận'}</td><td>\${j.location || 'N/A'}</td>
                    <td><span class="badge badge-\${j.status}">\${j.status === 'pending' ? 'Chờ duyệt' : j.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteJob('\${j.id}')">Xóa</button></td></tr>\`).join('') :
                    '<tr><td colspan="5"><div class="empty-state"><div class="icon">💼</div><p>Chưa có tin tuyển dụng nào</p></div></td></tr>'}</tbody></table></div>\`;
        }

        function renderApplicationsEmployer(container) {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            const myApps = applications.filter(a => myJobs.some(j => j.id === a.jobId));
            container.innerHTML = \`<div class="card"><h2>📋 Đơn ứng tuyển nhận được</h2>
                <table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Email</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>\${myApps.length ? myApps.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return \`<tr><td>\${a.candidateName}</td><td>\${job.title || 'N/A'}</td><td>\${a.candidateEmail || 'N/A'}</td>
                        <td><span class="badge badge-\${a.status}">\${getStatusText(a.status)}</span></td>
                        <td>\${a.status === 'new' || a.status === 'reviewed' ? \`
                            <button class="btn btn-success btn-sm" onclick="updateAppStatus('\${a.id}','interview')">Phỏng vấn</button>
                            <button class="btn btn-primary btn-sm" onclick="updateAppStatus('\${a.id}','accepted')">Nhận</button>
                            <button class="btn btn-danger btn-sm" onclick="updateAppStatus('\${a.id}','rejected')">Từ chối</button>\` : ''}</td></tr>\`;
                }).join('') : '<tr><td colspan="5"><div class="empty-state"><div class="icon">📋</div><p>Chưa có đơn ứng tuyển nào</p></div></td></tr>'}</tbody></table></div>\`;
        }

        function renderInterviewsEmployer(container) {
            const myInterviews = interviews.filter(i => i.employerId === currentUser.id);
            container.innerHTML = \`<div class="card"><h2>📅 Lịch phỏng vấn
                <button class="btn btn-primary" style="float:right" onclick="showCreateInterviewModal()">+ Tạo lịch</button></h2>
                <table><thead><tr><th>Ứng viên</th><th>Vị trí</th><th>Thời gian</th><th>Địa điểm</th><th>Trạng thái</th></tr></thead>
                <tbody>\${myInterviews.length ? myInterviews.map(i => \`<tr><td>\${i.candidateName}</td><td>\${i.jobTitle}</td>
                    <td>\${new Date(i.dateTime).toLocaleString('vi')}</td><td>\${i.location || 'N/A'}</td>
                    <td><span class="badge badge-\${i.status}">\${i.status === 'scheduled' ? 'Đã lên lịch' : 'Hoàn thành'}</span></td></tr>\`).join('') :
                    '<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>Chưa có lịch phỏng vấn nào</p></div></td></tr>'}</tbody></table></div>\`;
        }

        // CANDIDATE FUNCTIONS
        function renderJobsCandidate(container) {
            const approvedJobs = jobs.filter(j => j.status === 'approved');
            container.innerHTML = \`<div class="card"><h2>💼 Việc làm đang tuyển</h2>
                <div class="search-bar"><input type="text" placeholder="Tìm kiếm việc làm..." onkeyup="filterJobs(this.value)"></div>
                <div id="jobsList">\${approvedJobs.length ? approvedJobs.map(j => \`
                    <div class="job-item" style="border:1px solid #e1e5e9;border-radius:12px;padding:16px;margin-bottom:12px;">
                        <h3 style="color:#333;margin-bottom:8px;">\${j.title}</h3>
                        <p style="color:#666;margin-bottom:4px;">🏢 \${j.company} | 📍 \${j.location || 'N/A'} | 💰 \${j.salary || 'Thỏa thuận'}</p>
                        <p style="color:#888;font-size:13px;margin-bottom:12px;">\${j.description ? j.description.substring(0, 150) + '...' : ''}</p>
                        \${applications.some(a => a.jobId === j.id && a.candidateId === currentUser.id) ?
                            '<span class="badge badge-approved">Đã ứng tuyển</span>' :
                            \`<button class="btn btn-primary btn-sm" onclick="applyJob('\${j.id}','\${j.title}')">Ứng tuyển ngay</button>\`}
                    </div>\`).join('') : '<div class="empty-state"><div class="icon">💼</div><p>Chưa có việc làm nào</p></div>'}</div></div>\`;
        }

        function renderApplicationsCandidate(container) {
            const myApps = applications.filter(a => a.candidateId === currentUser.id);
            container.innerHTML = \`<div class="card"><h2>📋 Đơn ứng tuyển của tôi</h2>
                <table><thead><tr><th>Vị trí</th><th>Công ty</th><th>Ngày nộp</th><th>Trạng thái</th></tr></thead>
                <tbody>\${myApps.length ? myApps.map(a => {
                    const job = jobs.find(j => j.id === a.jobId) || {};
                    return \`<tr><td>\${job.title || 'N/A'}</td><td>\${job.company || 'N/A'}</td>
                        <td>\${new Date(a.createdAt).toLocaleDateString('vi')}</td>
                        <td><span class="badge badge-\${a.status}">\${getStatusText(a.status)}</span></td></tr>\`;
                }).join('') : '<tr><td colspan="4"><div class="empty-state"><div class="icon">📋</div><p>Bạn chưa ứng tuyển việc nào</p></div></td></tr>'}</tbody></table></div>\`;
        }

        function renderInterviewsCandidate(container) {
            const myInterviews = interviews.filter(i => i.candidateId === currentUser.id);
            container.innerHTML = \`<div class="card"><h2>📅 Lịch phỏng vấn của tôi</h2>
                <table><thead><tr><th>Vị trí</th><th>Công ty</th><th>Thời gian</th><th>Địa điểm</th><th>Trạng thái</th></tr></thead>
                <tbody>\${myInterviews.length ? myInterviews.map(i => \`<tr><td>\${i.jobTitle}</td><td>\${i.company || 'N/A'}</td>
                    <td>\${new Date(i.dateTime).toLocaleString('vi')}</td><td>\${i.location || 'N/A'}</td>
                    <td><span class="badge badge-\${i.status}">\${i.status === 'scheduled' ? 'Đã lên lịch' : 'Hoàn thành'}</span></td></tr>\`).join('') :
                    '<tr><td colspan="5"><div class="empty-state"><div class="icon">📅</div><p>Chưa có lịch phỏng vấn nào</p></div></td></tr>'}</tbody></table></div>\`;
        }

        function getStatusText(status) {
            const map = { 'new': 'Mới nộp', 'reviewed': 'Đã xem', 'interview': 'Phỏng vấn', 'accepted': 'Đã nhận', 'rejected': 'Từ chối', 'pending': 'Chờ duyệt' };
            return map[status] || status;
        }

        function filterJobs(keyword) {
            const items = document.querySelectorAll('.job-item');
            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(keyword.toLowerCase()) ? '' : 'none';
            });
        }

        function showModal(html) {
            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('modalOverlay').classList.add('active');
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function showCreateJobModal() {
            showModal(\`<h2>📝 Đăng tin tuyển dụng mới</h2>
                <div class="form-group"><label>Tiêu đề công việc</label><input type="text" id="jobTitle" required></div>
                <div class="form-group"><label>Tên công ty</label><input type="text" id="jobCompany" required></div>
                <div class="form-group"><label>Địa điểm</label><input type="text" id="jobLocation"></div>
                <div class="form-group"><label>Mức lương</label><input type="text" id="jobSalary" placeholder="VD: 15-25 triệu"></div>
                <div class="form-group"><label>Mô tả công việc</label><textarea id="jobDescription"></textarea></div>
                <div class="form-group"><label>Yêu cầu</label><textarea id="jobRequirements"></textarea></div>
                <div class="modal-actions">
                    <button class="btn btn-danger" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="createJob()">Đăng tin</button>
                </div>\`);
        }

        function showCreateInterviewModal() {
            const myJobs = jobs.filter(j => j.employerId === currentUser.id);
            const myApps = applications.filter(a => myJobs.some(j => j.id === a.jobId) && (a.status === 'interview' || a.status === 'new' || a.status === 'reviewed'));
            showModal(\`<h2>📅 Tạo lịch phỏng vấn</h2>
                <div class="form-group"><label>Chọn ứng viên</label>
                    <select id="interviewApp">\${myApps.map(a => {
                        const job = jobs.find(j => j.id === a.jobId) || {};
                        return \`<option value="\${a.id}" data-candidate="\${a.candidateName}" data-candidateid="\${a.candidateId}" data-job="\${job.title}" data-jobid="\${a.jobId}">\${a.candidateName} - \${job.title}</option>\`;
                    }).join('')}</select></div>
                <div class="form-group"><label>Thời gian</label><input type="datetime-local" id="interviewDate"></div>
                <div class="form-group"><label>Địa điểm / Link meeting</label><input type="text" id="interviewLocation"></div>
                <div class="form-group"><label>Hình thức</label>
                    <select id="interviewType"><option value="Trực tiếp">Trực tiếp</option><option value="Online">Online</option></select></div>
                <div class="form-group"><label>Ghi chú</label><textarea id="interviewNote"></textarea></div>
                <div class="modal-actions">
                    <button class="btn btn-danger" onclick="closeModal()">Hủy</button>
                    <button class="btn btn-primary" onclick="createInterview()">Tạo lịch</button>
                </div>\`);
        }

        async function createJob() {
            const job = {
                title: document.getElementById('jobTitle').value,
                company: document.getElementById('jobCompany').value,
                location: document.getElementById('jobLocation').value,
                salary: document.getElementById('jobSalary').value,
                description: document.getElementById('jobDescription').value,
                requirements: document.getElementById('jobRequirements').value,
                employerId: currentUser.id,
                employerName: currentUser.fullName,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            if (!job.title || !job.company) return alert('Vui lòng nhập đầy đủ thông tin!');
            await apiCall('/api/jobs', 'POST', job);
            closeModal(); loadData();
        }

        async function createInterview() {
            const select = document.getElementById('interviewApp');
            const option = select.options[select.selectedIndex];
            const interview = {
                applicationId: select.value,
                candidateName: option.dataset.candidate,
                candidateId: option.dataset.candidateid,
                jobTitle: option.dataset.job,
                jobId: option.dataset.jobid,
                employerId: currentUser.id,
                dateTime: document.getElementById('interviewDate').value,
                location: document.getElementById('interviewLocation').value,
                type: document.getElementById('interviewType').value,
                note: document.getElementById('interviewNote').value,
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };
            if (!interview.dateTime) return alert('Vui lòng chọn thời gian!');
            await apiCall('/api/interviews', 'POST', interview);
            closeModal(); loadData();
        }

        async function applyJob(jobId, jobTitle) {
            if (!confirm(\`Bạn muốn ứng tuyển vị trí "\${jobTitle}"?\`)) return;
            const application = {
                jobId, candidateId: currentUser.id, candidateName: currentUser.fullName,
                candidateEmail: currentUser.email, status: 'new', createdAt: new Date().toISOString()
            };
            await apiCall('/api/applications', 'POST', application);
            loadData();
        }

        async function updateJobStatus(jobId, status) {
            await apiCall(\`/api/jobs/\${jobId}\`, 'PUT', { status });
            loadData();
        }

        async function updateAppStatus(appId, status) {
            await apiCall(\`/api/applications/\${appId}\`, 'PUT', { status });
            loadData();
        }

        async function deleteJob(jobId) {
            if (!confirm('Xác nhận xóa tin tuyển dụng này?')) return;
            await apiCall(\`/api/jobs/\${jobId}\`, 'DELETE');
            loadData();
        }

        async function deleteUser(userId) {
            if (!confirm('Xác nhận xóa người dùng này?')) return;
            await apiCall(\`/api/users/\${userId}\`, 'DELETE');
            loadData();
        }

        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        loadData();
    </script>
</body>
</html>`;
}
l=D.r.filter(function(r){if(!f)return true;if(!ir(r.iso,f.from,f.to))return false;if(f.code&&!ms(r.code,f.code))return false;return true});lastFilteredR=fl;fl.forEach(function(r){var s=ga(r),oi=D.r.indexOf(r);var tr=document.createElement('tr');tr.innerHTML='<td><span class="code-link" data-rc="'+r.code+'">'+r.code+'</span></td><td>'+r.dept+'</td><td>'+r.position+'</td><td>'+r.qty+'</td><td>'+r.proposer+'</td><td>'+(r.location||'')+'</td><td>'+r.dateStr+'</td><td><span class="badge '+(s==='Đã duyệt'?'badge-approved':s==='Từ chối'?'badge-fail':'badge-pending')+'">'+s+'</span></td><td class="op-stamp">'+(r.opId||'')+' - '+(r.opName||'')+'</td><td class="op-stamp">'+fdt(r.iso)+'</td><td><button class="btn btn-edit" data-ri="'+oi+'" style="font-size:.78em;padding:5px 8px;margin-bottom:4px">Sửa</button><br><button class="btn btn-danger" data-rdi="'+oi+'" style="font-size:.78em;padding:5px 8px">Xóa</button></td>';tb.appendChild(tr)});
tb.querySelectorAll('.code-link').forEach(function(l){l.addEventListener('click',function(){curRC=this.getAttribute('data-rc');rnRD(curRC);show('recrDetailView')})});
tb.querySelectorAll('button[data-ri]').forEach(function(b){b.addEventListener('click',function(){openEditR(parseInt(this.getAttribute('data-ri')))})});
tb.querySelectorAll('button[data-rdi]').forEach(function(b){b.addEventListener('click',function(){
var idx = parseInt(this.getAttribute('data-rdi'));
if(confirm('Bạn có chắc chắn muốn xóa nhu cầu tuyển dụng này?')) {
log('Xóa NC', D.r[idx].code);
D.r.splice(idx, 1);
saveToServer();
rnR();
}
})});
document.getElementById('rInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.r.length}

function rnRD(code){var r=D.r.find(function(x){return x.code===code});if(!r)return;curRC=code;var h='<div class="detail-grid">';[['Mã','<strong>'+r.code+'</strong>'],['Phòng ban',r.dept],['Vị trí',r.position],['Cấp bậc',r.level],['Số lượng',r.qty],['Lý do tuyển dụng',r.reason||(r.reasons?r.reasons.join(', '):'')],['Địa điểm làm việc',r.location||''],['Thời gian làm việc',r.workTime||''],['Ngày cần nhân sự',fd(r.startDate)],['Môi trường làm việc',r.environment||''],['Mô tả công việc',r.jd||''],['Yêu cầu',r.requirements||''],['Chế độ phúc lợi',r.benefits||''],['Người thao tác',r.opId+' - '+r.opName],['Thời gian thao tác',fdt(r.iso)]].forEach(function(f){h+='<div class="label">'+f[0]+':</div><div class="value">'+(f[1]||'')+'</div>'});h+='</div>';document.getElementById('rdContent').innerHTML=h}

function rnC(f){var tb=document.getElementById('cTB');tb.innerHTML='';var fl=[];D.c.forEach(function(c,i){if(f){if(!ms(c.name,f.name))return;if(!ms(c.phone,f.phone))return;if(f.cccd&&!ms(c.cccd,f.cccd))return;if(!ir(c.iso,f.from,f.to))return}fl.push({c:c,i:i})});lastFilteredC=fl;fl.forEach(function(item){var c=item.c,idx=item.i;var w1=c.wishes?c.wishes[0]:'',w2=c.wishes?c.wishes[1]:'',w3=c.wishes?c.wishes[2]:'';var cvCell='';if(cvStore[idx]){cvCell='<a href="'+cvStore[idx].dataUrl+'" target="_blank" download="'+cvStore[idx].name+'" style="color:#3498db;font-weight:600;text-decoration:underline">'+cvStore[idx].name.substring(0,15)+(cvStore[idx].name.length>15?'...':'')+'</a>'}else{cvCell='<span style="color:#aaa;font-size:.82em">Chưa có</span>'}var tr=document.createElement('tr');tr.innerHTML='<td><span class="code-link" data-ci="'+idx+'">'+c.code+'</span></td><td style="font-weight:600">'+c.name+'</td><td>'+c.phone+'</td><td>'+(c.email||'')+'</td><td>'+cvCell+'</td><td style="font-size:.82em">'+w1+'</td><td style="font-size:.82em">'+w2+'</td><td style="font-size:.82em">'+w3+'</td><td class="op-stamp">'+(c.opId||'')+' - '+(c.opName||'')+'</td><td class="op-stamp">'+fdt(c.iso)+'</td><td><button class="btn btn-info" data-si="'+idx+'" style="font-size:.78em;padding:5px 8px">PV</button> <button class="btn btn-edit" data-ei="'+idx+'" style="font-size:.78em;padding:5px 8px">Sửa</button> <button class="btn btn-danger" data-cdi="'+idx+'" style="font-size:.78em;padding:5px 8px">Xóa</button></td>';tb.appendChild(tr)});
tb.querySelectorAll('.code-link[data-ci]').forEach(function(l){l.addEventListener('click',function(){rnCD(parseInt(this.getAttribute('data-ci')));show('candDetailView')})});
tb.querySelectorAll('button[data-si]').forEach(function(b){b.addEventListener('click',function(){openSched(parseInt(this.getAttribute('data-si')))})});
tb.querySelectorAll('button[data-ei]').forEach(function(b){b.addEventListener('click',function(){openEditC(parseInt(this.getAttribute('data-ei')))})});
tb.querySelectorAll('button[data-cdi]').forEach(function(b){b.addEventListener('click',function(){
var idx = parseInt(this.getAttribute('data-cdi'));
if(confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) {
log('Xóa UV', D.c[idx].code);
D.c.splice(idx, 1);
saveToServer();
rnC();
}
})});
document.getElementById('cInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.c.length}

function rnCD(idx){curCI=idx;var c=D.c[idx];if(!c)return;var h='<div class="section-title">Thông tin ứng viên</div><div class="detail-grid">';var w1=c.wishes?c.wishes[0]:'',w2=c.wishes?c.wishes[1]:'',w3=c.wishes?c.wishes[2]:'';var cvDisplay='Chưa có';if(cvStore[idx]){cvDisplay='<a href="'+cvStore[idx].dataUrl+'" target="_blank" download="'+cvStore[idx].name+'" style="color:#3498db;font-weight:700;text-decoration:underline">'+cvStore[idx].name+'</a> <span style="color:#888;font-size:.85em">('+fmtSize(cvStore[idx].size)+')</span>'}var fullPerm=(c.permAddr||'')+(c.permWard?', '+c.permWard:'')+(c.permCity?', '+c.permCity:'');var fullCurr=(c.currAddr||'')+(c.currWard?', '+c.currWard:'')+(c.currCity?', '+c.currCity:'');var expText='';if(c.experiences&&c.experiences.length){c.experiences.forEach(function(e){expText+=(expText?'; ':'')+e.time+' - '+e.job+' tại '+e.company})}var fields=[['Mã','<strong>'+c.code+'</strong>'],['Họ tên','<strong>'+c.name+'</strong>'],['Giới tính',c.gender],['Ngày sinh',fd(c.dob)],['CCCD',c.cccd],['SĐT',c.phone],['Gmail',c.email||''],['Trình độ',c.edu],['Trường',c.school||''],['CV',cvDisplay],['Vị trí 1',w1],['Vị trí 2',w2],['Vị trí 3',w3],['Người thao tác',(c.opId||'')+' - '+(c.opName||'')],['Thời gian thao tác',fdt(c.iso)]];fields.forEach(function(f){h+='<div class="label">'+f[0]+':</div><div class="value">'+f[1]+'</div>'});h+='</div>';document.getElementById('cdContent').innerHTML=h}

function rnIV(f){var tb=document.getElementById('iTB');tb.innerHTML='';var fl=D.iv.filter(function(iv){if(!f)return true;if(!ir(iv.iso,f.from,f.to))return false;if(!ms(iv.cn,f.name))return false;return true});lastFilteredIV=fl;fl.forEach(function(iv){var res=fivr(iv.code),oi=D.iv.indexOf(iv),ia=fia(iv.code);var tr=document.createElement('tr');tr.innerHTML='<td>'+iv.code+'</td><td>'+iv.cn+'</td><td>'+iv.pos+'</td><td>'+iv.ivrN+'</td><td>'+fdt(iv.time)+'</td><td>'+(iv.location||'')+'</td><td>'+iv.tests.join(',')+'</td><td>'+(res?'<span class="badge '+(res.result==='Đạt'?'badge-pass':'badge-fail')+'">'+res.result+'</span>'+(ia?' <span class="badge badge-ia">✓</span>':''):'<span class="badge badge-pending">Chờ</span>')+'</td><td class="op-stamp">'+(iv.opId||'')+' - '+(iv.opName||'')+'</td><td class="op-stamp">'+fdt(iv.iso)+'</td><td><button class="btn btn-edit" data-ivi="'+oi+'" style="font-size:.78em;padding:5px 8px">Sửa</button></td>';tb.appendChild(tr)});tb.querySelectorAll('button[data-ivi]').forEach(function(b){b.addEventListener('click',function(){openEditIV(parseInt(this.getAttribute('data-ivi')))})});document.getElementById('iInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.iv.length}

function rnRes(f){var tb=document.getElementById('resTB');tb.innerHTML='';var fl=D.iv.filter(function(iv){if(!f)return true;if(!ms(iv.cn,f.name))return false;if(!ir(iv.iso,f.from,f.to))return false;return true});lastFilteredRes=fl;fl.forEach(function(iv){var res=fivr(iv.code),ia=fia(iv.code),not=fnot(iv.code);var tr=document.createElement('tr'),h='<td>'+iv.code+'</td><td>'+iv.cn+'</td><td>'+iv.pos+'</td><td>'+fdt(iv.time)+'</td>';if(res){h+='<td><span class="badge '+(res.result==='Đạt'?'badge-pass':'badge-fail')+'">'+res.result+'</span></td>';h+='<td>'+(ia?'<span class="badge badge-ia">✓ ('+ia.score+'/50)</span>':'<span class="badge badge-pending">Chưa</span>')+'</td>';h+='<td class="op-stamp">'+(res.opId||'')+' - '+(res.opName||'')+'</td><td class="op-stamp">'+(res.time||'')+'</td>';h+='<td>';if(res.result==='Đạt'&&ia&&!not)h+='<button class="btn btn-notify notBtn" data-ic="'+iv.code+'" style="font-size:.8em;padding:6px 10px">TB</button>';else if(not)h+='<span class="badge badge-notified">Đã TB</span>';else h+='✓';h+='</td>'}else{h+='<td><select class="rs" data-ic="'+iv.code+'" style="padding:6px;border-radius:6px;border:1px solid #ddd"><option value="">-</option><option value="Đạt">Đạt</option><option value="Không đạt">Không đạt</option></select></td><td>-</td><td>-</td><td>-</td><td><button class="btn btn-success sv" data-ic="'+iv.code+'" style="font-size:.8em;padding:6px 10px">Lưu</button></td>'}tr.innerHTML=h;tb.appendChild(tr)});tb.querySelectorAll('button.sv').forEach(function(b){b.addEventListener('click',function(){saveRes(this.getAttribute('data-ic'))})});tb.querySelectorAll('button.notBtn').forEach(function(b){b.addEventListener('click',function(){openNotifyForm(this.getAttribute('data-ic'))})})}

function rnOB(f){var tb=document.getElementById('oTB');tb.innerHTML='';var fl=D.ob.filter(function(ob){if(!f)return true;if(!ms(ob.cn,f.name))return false;var c=fcand(ob.cc);if(f.phone&&c&&!ms(c.phone,f.phone))return false;if(!ir(ob.pd,f.from,f.to))return false;return true});lastFilteredOB=fl;fl.forEach(function(ob){var oi=D.ob.indexOf(ob);var tr=document.createElement('tr');tr.innerHTML='<td>'+ob.cc+'</td><td><strong>'+ob.cn+'</strong></td><td>'+ob.pos+'</td><td>'+(ob.dept||'')+'</td><td>'+(ob.startDate?fd(ob.startDate):'')+'</td><td>'+(ob.trialSalary||ob.salary||'')+'</td><td><span class="badge '+(ob.st==='Đã XN'?'badge-confirmed':'badge-pending')+'">'+ob.st+'</span></td><td class="op-stamp">'+(ob.confirmOpId||'')+' '+(ob.confirmOpName||'')+'</td><td class="op-stamp">'+(ob.confirmTime||'')+'</td><td>'+(ob.st==='Chờ xác nhận'?'<button class="btn btn-success obBtn" data-oi="'+oi+'" style="font-size:.8em;padding:6px 10px">XN</button>':'<span class="badge badge-confirmed">✓</span>')+'</td>';tb.appendChild(tr)});tb.querySelectorAll('button.obBtn').forEach(function(b){b.addEventListener('click',function(){openOBForm(parseInt(this.getAttribute('data-oi')))})});document.getElementById('oInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.ob.length}

function saveRes(code){var sel=document.querySelector('.rs[data-ic="'+code+'"]');if(!sel||!sel.value){alert('Chọn kết quả!');return}if(sel.value==='Đạt'){openIAForm(code);return}D.ivr.push({ic:code,result:sel.value,note:'',opId:op.id,opName:op.name,time:ffdt()});log('KQ: '+sel.value,code);saveToServer();rnRes();alert('Đã lưu: Không đạt')}

function openIAForm(ivCode){var iv=fiv(ivCode);if(!iv)return;document.getElementById('iaForm').reset();document.getElementById('ia_ivCode').value=ivCode;document.getElementById('iaCandidate').innerHTML='<strong>'+iv.cn+'</strong> ('+iv.cc+') | Vị trí: '+iv.pos;document.getElementById('ia_evaluator').value=op.name;document.getElementById('iaTechScore').textContent='- / 25';document.getElementById('iaSoftScore').textContent='- / 25';document.getElementById('iaTotalScore').textContent='- / 50';document.getElementById('iaModal').classList.add('active')}

document.getElementById('iaForm').addEventListener('submit',function(e){e.preventDefault();var ivCode=document.getElementById('ia_ivCode').value,score=calcEvalScores();if(score===null){alert('Đánh giá tất cả tiêu chí!');return}if(!this.checkValidity()){this.reportValidity();return}var ev=document.getElementById('ia_evaluator').value.trim();if(!isUpper(ev)){alert('Tên IN HOA!');return}var fit=document.querySelector('input[name="ia_fit"]:checked'),con=document.querySelector('input[name="ia_conclusion"]:checked');if(!fit||!con){alert('Chọn mức phù hợp & kết luận!');return}D.ia.push({ic:ivCode,score:score,fit:fit.value,conclusion:con.value,proposedSalary:document.getElementById('ia_proposedSalary').value.trim(),comment:document.getElementById('ia_comment').value.trim(),evaluator:ev,evalTitle:document.getElementById('ia_evalTitle').value.trim(),opId:op.id,opName:op.name,time:ffdt()});var rm={'Đề xuất tuyển':'Đạt','Đề xuất dự bị':'Đạt','Không tuyển':'Không đạt'};D.ivr.push({ic:ivCode,result:rm[con.value]||'Đạt',note:'Điểm:'+score+'/50|'+con.value,opId:op.id,opName:op.name,time:ffdt()});
if (con.value === 'Đề xuất tuyển') {
var ivObj = fiv(ivCode);
if (ivObj) {
var matchedR = D.r.find(function(r) { return r.position.trim().toLowerCase() === ivObj.pos.trim().toLowerCase() && parseInt(r.qty) > 0; });
if (matchedR) {
matchedR.qty = parseInt(matchedR.qty) - 1;
}
}
}
log('KQ+Đánh giá',ivCode);saveToServer();document.getElementById('iaModal').classList.remove('active');rnRes();alert('Đã lưu!')});

document.getElementById('btnCloseIA').addEventListener('click',function(){document.getElementById('iaModal').classList.remove('active')});

function openNotifyForm(ivCode){var iv=fiv(ivCode);if(!iv)return;var ia=fia(ivCode);document.getElementById('nf_ivCode').value=ivCode;document.getElementById('nfCandidate').innerHTML='<strong>'+iv.cn+'</strong> ('+iv.cc+')<br>Vị trí: '+iv.pos+(ia?'<br>Điểm: <strong>'+ia.score+'/50</strong> | '+ia.conclusion:'');document.getElementById('nf_position').value=iv.pos;document.getElementById('nf_dept').value=iv.dept||'';document.getElementById('nf_salary').value=ia?ia.proposedSalary:'';document.getElementById('nf_trialSalary').value='';document.getElementById('notifyModal').classList.add('active')}

document.getElementById('nf_busRegister').addEventListener('change',function(){document.getElementById('nf_busDetails').style.display=this.checked?'flex':'none'});

document.getElementById('notifyForm').addEventListener('submit',function(e){e.preventDefault();if(!this.checkValidity()){this.reportValidity();return}var ivCode=document.getElementById('nf_ivCode').value,iv=fiv(ivCode);if(!iv)return;var al=[];document.querySelectorAll('input[name="nf_allowance"]:checked').forEach(function(c){al.push(c.value)});var pm=document.querySelector('input[name="nf_payMethod"]:checked');var nd={ic:ivCode,cc:iv.cc,cn:iv.cn,pos:document.getElementById('nf_position').value,dept:document.getElementById('nf_dept').value,trialSalary:document.getElementById('nf_trialSalary').value.trim(),salary:document.getElementById('nf_salary').value.trim(),allowances:al,bhSalary:document.getElementById('nf_bhSalary').value.trim(),payMethod:pm?pm.value:'',startDate:document.getElementById('nf_startDate').value,deadline:document.getElementById('nf_deadline').value,busRegister:document.getElementById('nf_busRegister').checked,busRoute:document.getElementById('nf_busRoute').value.trim(),busStop:document.getElementById('nf_busStop').value.trim(),note:document.getElementById('nf_note').value.trim(),opId:op.id,opName:op.name,time:ffdt()};D.notify.push(nd);if(!fob(iv.cc))D.ob.push({cc:iv.cc,cn:iv.cn,pos:nd.pos,dept:nd.dept,startDate:nd.startDate,deadline:nd.deadline,trialSalary:nd.trialSalary,salary:nd.salary,pd:gn(),st:'Chờ xác nhận'});log('TB trúng tuyển',iv.cn);saveToServer();document.getElementById('notifyModal').classList.remove('active');rnRes();alert('Đã gửi TB!')});

document.getElementById('btnCloseNotify').addEventListener('click',function(){document.getElementById('notifyModal').classList.remove('active')});

function openOBForm(i){var ob=D.ob[i];if(!ob)return;var c=fcand(ob.cc);document.getElementById('ob_idx').value=i;document.getElementById('ob_name').value=ob.cn;document.getElementById('ob_empId').value='';document.getElementById('ob_startDate').value=ob.startDate||'';document.getElementById('ob_phone').value=c?c.phone:'';document.getElementById('ob_personalEmail').value=c?c.email:'';document.getElementById('ob_confirm').checked=false;document.getElementById('obCandInfo').innerHTML='<strong>'+ob.cn+'</strong> ('+ob.cc+')'+(c?'<br>SĐT: '+c.phone:'')+'<br>Vị trí: '+ob.pos;document.getElementById('obFormModal').classList.add('active')}

document.getElementById('obForm').addEventListener('submit',function(e){e.preventDefault();if(!document.getElementById('ob_confirm').checked){alert('Xác nhận!');return}if(!document.getElementById('ob_empId').value.trim()){alert('Nhập mã NV!');return}var idx=parseInt(document.getElementById('ob_idx').value),ob=D.ob[idx];if(!ob)return;var ckItems=['ck_cccd','ck_cv2','ck_health','ck_degree','ck_birth'],ck={},t=0,ch=0;ckItems.forEach(function(id){var cb=document.getElementById(id);ck[id]=cb.checked;t++;if(cb.checked)ch++});ob.st='Đã XN';ob.newEmpId=document.getElementById('ob_empId').value.trim();ob.actualStartDate=document.getElementById('ob_startDate').value;ob.checklist=ck;ob.checklistScore=ch+'/'+t;ob.confirmOpId=op.id;ob.confirmOpName=op.name;ob.confirmTime=ffdt();log('XN nhận việc',ob.cn+' - '+ob.newEmpId);saveToServer();document.getElementById('obFormModal').classList.remove('active');rnOB();alert('Xác nhận: '+ob.cn)});

document.getElementById('btnCloseOBForm').addEventListener('click',function(){document.getElementById('obFormModal').classList.remove('active')});

function openEditR(i){var r=D.r[i];document.getElementById('rf_ei').value=i;document.getElementById('rfTitle').textContent='Sửa: '+r.code;document.getElementById('rfBanner').style.display='flex';document.getElementById('rfCode').textContent=r.code;document.getElementById('rfBtn').textContent='Cập nhật';document.getElementById('rf_dept').value=r.dept;document.getElementById('rf_proposer').value=r.proposer;document.getElementById('rf_position').value=r.position;document.getElementById('rf_level').value=r.level;document.getElementById('rf_qty').value=r.qty;document.getElementById('rf_startDate').value=r.startDate||'';document.getElementById('rf_jd').value=r.jd||'';if(document.getElementById('rf_environment'))document.getElementById('rf_environment').value=r.environment||'';if(document.getElementById('rf_requirements'))document.getElementById('rf_requirements').value=r.requirements||'';if(document.getElementById('rf_benefits'))document.getElementById('rf_benefits').value=r.benefits||'';var reasonSel=document.getElementById('rf_reason_select');if(reasonSel){var rv=r.reason||'';if(rv.indexOf('Khác:')===0){reasonSel.value='Khác';document.getElementById('rfReasonOtherGroup').style.display='block';document.getElementById('rf_reasonOther').value=rv.replace('Khác: ','');}else{var found=false;for(var j=0;j<reasonSel.options.length;j++){if(reasonSel.options[j].value===rv){found=true;break;}}if(found)reasonSel.value=rv;else if(r.reasons&&r.reasons.length>0){reasonSel.value=r.reasons[0]||'';}document.getElementById('rfReasonOtherGroup').style.display='none';}}if(r.location){var lr2=document.querySelector('input[name="rf_location"][value="'+r.location+'"]');if(lr2)lr2.checked=true}if(r.workTime){var wr2=document.querySelector('input[name="rf_workTime"][value="'+r.workTime+'"]');if(wr2)wr2.checked=true}show('recrFormView')}

function openEditC(i){var c=D.c[i];document.getElementById('cf_ei').value=i;document.getElementById('cfTitle').textContent='Sửa: '+c.code;document.getElementById('cfBanner').style.display='flex';document.getElementById('cfCode').textContent=c.code;document.getElementById('cfBtn').textContent='Cập nhật';document.getElementById('cf_bophan').value=c.bophan||'';document.getElementById('cf_ivDate').value=c.ivDate||'';document.getElementById('cf_sobaodanh').value=c.sobaodanh||'';document.getElementById('cf_name').value=c.name;document.getElementById('cf_dob').value=c.dob;document.getElementById('cf_gender').value=c.gender;document.getElementById('cf_ethnic').value=c.ethnic||'';if(c.marital){var mr=document.querySelector('input[name="cf_marital"][value="'+c.marital+'"]');if(mr)mr.checked=true}document.getElementById('cf_children').value=c.children||0;document.getElementById('cf_childAge').value=c.childAge||'';document.getElementById('cf_cccd').value=c.cccd;document.getElementById('cf_cccdDate').value=c.cccdDate||'';document.getElementById('cf_cccdPlace').value=c.cccdPlace||'';document.getElementById('cf_cccdExpiry').value=c.cccdExpiry||'';document.getElementById('cf_phone').value=c.phone;document.getElementById('cf_relativePhone').value=c.relativePhone||'';document.getElementById('cf_permAddr').value=c.permAddr||'';document.getElementById('cf_permWard').value=c.permWard||'';document.getElementById('cf_permCity').value=c.permCity||'';document.getElementById('cf_currAddr').value=c.currAddr||'';document.getElementById('cf_currWard').value=c.currWard||'';document.getElementById('cf_currCity').value=c.currCity||'';document.getElementById('cf_height').value=c.height||'';document.getElementById('cf_weight').value=c.weight||'';document.getElementById('cf_shoeSize').value=c.shoeSize||'';document.getElementById('cf_email').value=c.email||'';document.getElementById('cf_edu').value=c.edu;document.getElementById('cf_school').value=c.school||'';document.getElementById('cf_gradYear').value=c.gradYear||'';document.getElementById('cf_major').value=c.major||'';setExpData(c.experiences);if(c.prevIV){var pv=document.querySelector('input[name="cf_prevIV"][value="'+c.prevIV+'"]');if(pv)pv.checked=true;if(c.prevIV==='Đã PV')document.getElementById('cf_prevIVDetail').style.display='flex'}document.getElementById('cf_prevIVTimes').value=c.prevIVTimes||'';document.getElementById('cf_prevIVWhen').value=c.prevIVWhen||'';if(c.availTime){var at=document.querySelector('input[name="cf_availTime"][value="'+c.availTime+'"]');if(at)at.checked=true;if(c.availTime==='Chọn ngày')document.getElementById('cf_availDateWrap').style.display='flex'}document.getElementById('cf_availDate').value=c.availDate||'';document.getElementById('cf_availReason').value=c.availReason||'';if(c.smoke){var sm=document.querySelector('input[name="cf_smoke"][value="'+c.smoke+'"]');if(sm)sm.checked=true}if(c.disease){var ds=document.querySelector('input[name="cf_disease"][value="'+c.disease+'"]');if(ds)ds.checked=true}document.querySelectorAll('input[name="cf_src"]').forEach(function(cb){cb.checked=c.sources?c.sources.indexOf(cb.value)>=0:false});document.getElementById('cf_channel').value=c.channel||'';if(c.bus){var bs=document.querySelector('input[name="cf_bus"][value="'+c.bus+'"]');if(bs)bs.checked=true;if(c.bus==='Có')document.getElementById('cf_busDetailWrap').style.display='flex'}document.getElementById('cf_busStop').value=c.busStop||'';document.getElementById('cf_chinese').value=c.chinese||'Không';document.getElementById('cf_english').value=c.english||'Không';document.getElementById('cf_expYears').value=c.expYears||0;
populateWishesSelects();
function ensureOption(selId, val) {
    if(!val) return;
    var sel = document.getElementById(selId);
    var found = false;
    for(var j=0; j<sel.options.length; j++){
        if(sel.options[j].value === val) { found = true; break; }
    }
    if(!found) {
        var opt = document.createElement('option');
        opt.value = val; opt.text = val;
        sel.add(opt);
    }
    sel.value = val;
}
if(c.wishes){ensureOption('cf_wish1', c.wishes[0]);ensureOption('cf_wish2', c.wishes[1]);ensureOption('cf_wish3', c.wishes[2]);}
document.getElementById('cf_commit').checked=true;loadCVForEdit(i);show('candFormView')}

function openSched(i){var c=D.c[i];document.getElementById('si_ci').value=i;document.getElementById('si_ei').value=-1;document.getElementById('sfTitle').textContent='Đặt Lịch PV';document.getElementById('sfBanner').style.display='none';document.getElementById('sfBtn').textContent='Xác nhận';document.getElementById('sfInfo').innerHTML='<div class="candidate-detail-card"><strong>'+c.name+'</strong> ('+c.code+') | '+c.phone+'</div>';document.getElementById('si_name').value='';document.getElementById('si_id').value='';document.getElementById('si_title').value='';document.getElementById('si_time').value='';document.getElementById('si_location').value='';document.getElementById('si_ivPosition').value='';document.querySelectorAll('input[name="si_test"]').forEach(function(cb){cb.checked=false});show('schedFormView')}

function openEditIV(i){var iv=D.iv[i],ci=D.c.findIndex(function(c){return c.code===iv.cc});document.getElementById('si_ei').value=i;document.getElementById('si_ci').value=ci;document.getElementById('sfTitle').textContent='Sửa: '+iv.code;document.getElementById('sfBanner').style.display='flex';document.getElementById('sfCode').textContent=iv.code;document.getElementById('sfBtn').textContent='Cập nhật';document.getElementById('sfInfo').innerHTML='<div class="candidate-detail-card"><strong>'+iv.cn+'</strong> ('+iv.cc+')</div>';document.getElementById('si_name').value=iv.ivrN;document.getElementById('si_id').value=iv.ivrId;document.getElementById('si_title').value=iv.ivrT||'';document.getElementById('si_time').value=iv.time||'';document.getElementById('si_location').value=iv.location||'';document.getElementById('si_ivPosition').value=iv.pos||'';document.querySelectorAll('input[name="si_test"]').forEach(function(cb){cb.checked=iv.tests.indexOf(cb.value)>=0});show('schedFormView')}

function valR(){var v=true,p=document.getElementById('rf_proposer').value.trim();if(!isUpper(p)){document.getElementById('err_rf_proposer').style.display='block';v=false}else document.getElementById('err_rf_proposer').style.display='none';var ei=parseInt(document.getElementById('rf_ei').value),pos=document.getElementById('rf_position').value.trim(),dept=document.getElementById('rf_dept').value;if(pos&&dept&&checkDupRecr(pos,dept,ei)){document.getElementById('rfDupWarn').style.display='flex';document.getElementById('rfDupMsg').textContent='Trùng: "'+pos+'" - "'+dept+'"';v=false}else document.getElementById('rfDupWarn').style.display='none';return v}

function valC(){var v=true,ck=function(e,t){if(!t){document.getElementById(e).style.display='block';v=false}else document.getElementById(e).style.display='none'};ck('err_cf_name',isUpper(document.getElementById('cf_name').value.trim()));ck('err_cf_dob',!!document.getElementById('cf_dob').value);ck('err_cf_gender',!!document.getElementById('cf_gender').value);ck('err_cf_bophan',!!document.getElementById('cf_bophan').value);ck('err_cf_cccd',/^\d{12}$/.test(document.getElementById('cf_cccd').value.trim()));var ph=document.getElementById('cf_phone').value.trim();ck('err_cf_phone',/^0\d{9}$/.test(ph));var ei=parseInt(document.getElementById('cf_ei').value);if(checkDupCandPhone(ph,ei)){document.getElementById('err_cf_phone_dup').style.display='block';v=false}else document.getElementById('err_cf_phone_dup').style.display='none';var em=document.getElementById('cf_email').value.trim();if(em){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){document.getElementById('err_cf_email').style.display='block';v=false}else document.getElementById('err_cf_email').style.display='none';if(checkDupCandEmail(em,ei)){document.getElementById('err_cf_email_dup').style.display='block';v=false}else document.getElementById('err_cf_email_dup').style.display='none'}else{document.getElementById('err_cf_email').style.display='none';document.getElementById('err_cf_email_dup').style.display='none'}ck('err_cf_perm',!!document.getElementById('cf_permAddr').value.trim());ck('err_cf_marital',!!document.querySelector('input[name="cf_marital"]:checked'));ck('err_cf_prevIV',!!document.querySelector('input[name="cf_prevIV"]:checked'));ck('err_cf_availTime',!!document.querySelector('input[name="cf_availTime"]:checked'));ck('err_cf_wish1',!!document.getElementById('cf_wish1').value.trim());ck('err_cf_edu',!!document.getElementById('cf_edu').value);ck('err_cf_src',document.querySelectorAll('input[name="cf_src"]:checked').length>0);if(!document.getElementById('cf_commit').checked){document.getElementById('err_cf_commit').style.display='block';v=false}else document.getElementById('err_cf_commit').style.display='none';return v}

function valSI(){var v=true,nm=document.getElementById('si_name').value.trim();if(!isUpper(nm)){document.getElementById('err_si_name').style.display='block';v=false}else document.getElementById('err_si_name').style.display='none';var t=document.getElementById('si_title').value;if(!t||t==='Nhân viên'||t==='Kỹ sư'){document.getElementById('err_si_level').style.display='block';v=false}else document.getElementById('err_si_level').style.display='none';if(!document.querySelectorAll('input[name="si_test"]:checked').length){document.getElementById('err_si_test').style.display='block';v=false}else document.getElementById('err_si_test').style.display='none';document.getElementById('err_si_dup_time').style.display='none';return v}

document.querySelectorAll('input[name="cf_prevIV"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_prevIVDetail').style.display=this.value==='Đã PV'?'flex':'none'})});

document.querySelectorAll('input[name="cf_availTime"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_availDateWrap').style.display=this.value==='Chọn ngày'?'flex':'none'})});

document.querySelectorAll('input[name="cf_bus"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_busDetailWrap').style.display=this.value==='Có'?'flex':'none'})});

document.querySelectorAll('.uppercase-input').forEach(function(inp){inp.addEventListener('input',function(){var p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p,p)})});

document.getElementById('loginForm').addEventListener('submit',function(e){e.preventDefault();var id=document.getElementById('login_empId').value.trim(),nm=document.getElementById('login_empName').value.trim().toUpperCase(),dp=document.getElementById('login_empDept').value,tt=document.getElementById('login_empTitle').value;if(!id||!nm||!dp||!tt||!isUpper(nm)){document.getElementById('loginError').style.display='block';return}op={id:id,name:nm,dept:dp,title:tt};document.getElementById('loginOverlay').style.display='none';document.getElementById('operatorBar').style.display='flex';document.getElementById('dispEmpId').textContent=id;document.getElementById('dispEmpName').textContent=nm;document.getElementById('dispEmpDept').textContent=dp;document.getElementById('dispEmpTitle').textContent=tt;startClock();log('Đăng nhập');saveToServer();show('mainView')});

document.getElementById('btnChangeOp').addEventListener('click',function(){log('Đăng xuất');saveToServer();document.getElementById('loginOverlay').style.display='flex';document.getElementById('operatorBar').style.display='none';show('mainView')});

document.getElementById('btnGoRecr').addEventListener('click',function(){rnR();show('recrListView')});
document.getElementById('btnGoCand').addEventListener('click',function(){rnC();show('candListView')});
document.getElementById('btnGoIV').addEventListener('click',function(){rnIV();show('ivListView')});
document.getElementById('btnGoRes').addEventListener('click',function(){rnRes();show('resView')});
document.getElementById('btnGoOB').addEventListener('click',function(){rnOB();show('obView')});
document.getElementById('btnBackRecrList').addEventListener('click',function(){back('mainView')});
document.getElementById('btnBackRF').addEventListener('click',function(){back('recrListView')});
document.getElementById('btnBackRD').addEventListener('click',function(){back('recrListView')});
document.getElementById('btnBackCL').addEventListener('click',function(){back('mainView')});
document.getElementById('btnBackCF').addEventListener('click',function(){back('candListView')});
document.getElementById('btnBackCD').addEventListener('click',function(){back('candListView')});
document.getElementById('btnBackIVL').addEventListener('click',function(){back('mainView')});
document.getElementById('btnBackSF').addEventListener('click',function(){back('candListView')});
document.getElementById('btnBackRes').addEventListener('click',function(){back('mainView')});
document.getElementById('btnBackOB').addEventListener('click',function(){back('mainView')});

document.getElementById('btnNewRecr').addEventListener('click',function(){resetF('recrForm');document.getElementById('rf_ei').value=-1;document.getElementById('rfTitle').textContent='Tạo Nhu Cầu';document.getElementById('rfBanner').style.display='none';document.getElementById('rfBtn').textContent='Lưu';document.getElementById('rfDupWarn').style.display='none';show('recrFormView')});

document.getElementById('btnNewCand').addEventListener('click',function(){resetF('candForm');document.getElementById('cf_ei').value=-1;document.getElementById('cfTitle').textContent='THÔNG TIN TRƯỚC PHỎNG VẤN';document.getElementById('cfBanner').style.display='none';document.getElementById('cfBtn').textContent='Lưu';clearCV();setExpData([]);document.getElementById('cf_prevIVDetail').style.display='none';document.getElementById('cf_availDateWrap').style.display='none';document.getElementById('cf_busDetailWrap').style.display='none';populateWishesSelects();show('candFormView')});

document.getElementById('btnSchedDetail').addEventListener('click',function(){if(curCI>=0)openSched(curCI)});
document.getElementById('btnEditR').addEventListener('click',function(){var i=D.r.findIndex(function(r){return r.code===curRC});if(i>=0)openEditR(i)});
document.getElementById('btnEditC').addEventListener('click',function(){if(curCI>=0)openEditC(curCI)});

document.getElementById('btnFR').addEventListener('click',function(){rnR({from:document.getElementById('fR_from').value,to:document.getElementById('fR_to').value,code:document.getElementById('fR_code').value.trim()})});
document.getElementById('btnRR').addEventListener('click',function(){document.getElementById('fR_from').value='';document.getElementById('fR_to').value='';document.getElementById('fR_code').value='';rnR()});
document.getElementById('btnFC').addEventListener('click',function(){rnC({name:document.getElementById('fC_name').value.trim(),phone:document.getElementById('fC_phone').value.trim(),cccd:document.getElementById('fC_cccd').value.trim(),from:document.getElementById('fC_from').value,to:document.getElementById('fC_to').value})});
document.getElementById('btnRC').addEventListener('click',function(){document.getElementById('fC_name').value='';document.getElementById('fC_phone').value='';document.getElementById('fC_cccd').value='';document.getElementById('fC_from').value='';document.getElementById('fC_to').value='';rnC()});
document.getElementById('btnFI').addEventListener('click',function(){rnIV({from:document.getElementById('fI_from').value,to:document.getElementById('fI_to').value,name:document.getElementById('fI_name').value.trim()})});
document.getElementById('btnRI').addEventListener('click',function(){document.getElementById('fI_from').value='';document.getElementById('fI_to').value='';document.getElementById('fI_name').value='';rnIV()});
document.getElementById('btnFRes').addEventListener('click',function(){rnRes({name:document.getElementById('fRes_name').value.trim(),from:document.getElementById('fRes_from').value,to:document.getElementById('fRes_to').value})});
document.getElementById('btnRRes').addEventListener('click',function(){document.getElementById('fRes_name').value='';document.getElementById('fRes_from').value='';document.getElementById('fRes_to').value='';rnRes()});
document.getElementById('btnFO').addEventListener('click',function(){rnOB({name:document.getElementById('fO_name').value.trim(),phone:document.getElementById('fO_phone').value.trim(),from:document.getElementById('fO_from').value,to:document.getElementById('fO_to').value})});
document.getElementById('btnRO').addEventListener('click',function(){document.getElementById('fO_name').value='';document.getElementById('fO_phone').value='';document.getElementById('fO_from').value='';document.getElementById('fO_to').value='';rnOB()});

document.getElementById('btnClosePDF').addEventListener('click',function(){document.getElementById('pdfModal').classList.remove('active')});
document.getElementById('btnDLPDF').addEventListener('click',dlPDF);
document.getElementById('btnPrint').addEventListener('click',printD);

document.getElementById('btnPDFRecrList').addEventListener('click',function(){var h=['Mã','PB','Vị trí','SL','ĐĐ','TT'];var r=D.r.map(function(x){return[x.code,x.dept,x.position,x.qty,x.location||'',ga(x)]});showPDF('NHU CẦU TUYỂN DỤNG',genPH('NHU CẦU TUYỂN DỤNG',tH(h,r)))});
document.getElementById('btnPDFRD').addEventListener('click',function(){showPDF('CHI TIẾT NHU CẦU',genPH('CHI TIẾT NHU CẦU',document.getElementById('rdContent').innerHTML))});
document.getElementById('btnPrintRD').addEventListener('click',function(){document.getElementById('btnPDFRD').click();setTimeout(printD,300)});
document.getElementById('btnPDFCL').addEventListener('click',function(){var h=['Mã','Tên','SĐT','Email','Vị trí 1'];var r=D.c.map(function(c){return[c.code,c.name,c.phone,c.email||'',c.wishes?c.wishes[0]:'']});showPDF('ỨNG VIÊN',genPH('ỨNG VIÊN',tH(h,r)))});
document.getElementById('btnPDFCD').addEventListener('click',function(){if(curCI<0)return;var c=D.c[curCI];showPDF('THONG_TIN_TRUOC_PHONG_VAN_'+c.name,genShinEtsuPDF(c,curCI))});
document.getElementById('btnPDFIVL').addEventListener('click',function(){var h=['Mã PV','Tên','Vị trí','Thời gian','Test','KQ'];var r=D.iv.map(function(iv){var res=fivr(iv.code);return[iv.code,iv.cn,iv.pos,fdt(iv.time),iv.tests.join(','),res?res.result:'Chờ']});showPDF('PHỎNG VẤN',genPH('PHỎNG VẤN',tH(h,r)))});
document.getElementById('btnPDFRes').addEventListener('click',function(){var h=['Mã','Tên','KQ','Điểm'];var r=D.iv.map(function(iv){var res=fivr(iv.code),ia=fia(iv.code);return[iv.code,iv.cn,res?res.result:'Chờ',ia?ia.score+'/50':'']});showPDF('KẾT QUẢ PV',genPH('KẾT QUẢ PV',tH(h,r)))});
document.getElementById('btnPDFOB').addEventListener('click',function(){var h=['Mã','Tên','Vị trí','PB','TT'];var r=D.ob.map(function(ob){return[ob.cc,ob.cn,ob.pos,ob.dept||'',ob.st]});showPDF('NHÂN VIÊN MỚI',genPH('NHÂN VIÊN MỚI',tH(h,r)))});

document.getElementById('btnExcelRL').addEventListener('click',function(){var data=(lastFilteredR||D.r).map(function(r){return[r.code,r.dept,r.position,r.qty,r.proposer,r.location||'',r.dateStr,ga(r),r.opId+' - '+r.opName,fdt(r.iso)]});exportExcel(['Mã','Phòng ban','Vị trí','SL','Người ĐX','Địa điểm','Ngày tạo','TT','Người TT','Thời gian TT'],data,'NhuCauTuyenDung')});
document.getElementById('btnExcelCL').addEventListener('click',function(){var data=(lastFilteredC||[]).map(function(item){var c=item.c||item;return[c.code,c.name,c.phone,c.email||'',c.wishes?c.wishes[0]:'',c.wishes?c.wishes[1]:'',c.wishes?c.wishes[2]:'',c.opId+' - '+c.opName,fdt(c.iso)]});if(!data.length)data=D.c.map(function(c){return[c.code,c.name,c.phone,c.email||'',c.wishes?c.wishes[0]:'',c.wishes?c.wishes[1]:'',c.wishes?c.wishes[2]:'',c.opId+' - '+c.opName,fdt(c.iso)]});exportExcel(['Mã','Họ tên','SĐT','Email','Vị trí 1','Vị trí 2','Vị trí 3','Người TT','Thời gian TT'],data,'UngVien')});
document.getElementById('btnExcelIVL').addEventListener('click',function(){var data=(lastFilteredIV||D.iv).map(function(iv){var res=fivr(iv.code);return[iv.code,iv.cn,iv.pos,iv.ivrN,fdt(iv.time),iv.location||'',iv.tests.join(','),res?res.result:'Chờ',iv.opId+' - '+iv.opName,fdt(iv.iso)]});exportExcel(['Mã PV','Họ tên','Vị trí','Người PV','Thời gian','Địa điểm','Test','KQ','Người TT','Thời gian TT'],data,'LichPhongVan')});
document.getElementById('btnExcelRes').addEventListener('click',function(){var data=(lastFilteredRes||D.iv).map(function(iv){var res=fivr(iv.code),ia=fia(iv.code);return[iv.code,iv.cn,iv.pos,fdt(iv.time),res?res.result:'Chờ',ia?ia.score+'/50':'',res?(res.opId+' - '+res.opName):'',res?res.time:'']});exportExcel(['Mã PV','Họ tên','Vị trí','Thời gian','KQ','Điểm','Người TT','Thời gian TT'],data,'KetQuaPV')});
document.getElementById('btnExcelOB').addEventListener('click',function(){var data=(lastFilteredOB||D.ob).map(function(ob){return[ob.cc,ob.cn,ob.pos,ob.dept||'',ob.startDate?fd(ob.startDate):'',ob.trialSalary||ob.salary||'',ob.st,ob.confirmOpId||'',ob.confirmTime||'']});exportExcel(['Mã UV','Họ tên','Vị trí','Phòng ban','Ngày BĐ','Lương TV','TT','Người TT','Thời gian TT'],data,'NhanVienMoi')});

document.getElementById('recrForm').addEventListener('submit',function(e){e.preventDefault();if(!valR())return;if(!this.checkValidity()){this.reportValidity();return}var reasonVal=document.getElementById('rf_reason_select').value;if(reasonVal==='Khác'){var otherR=document.getElementById('rf_reasonOther').value.trim();if(!otherR){alert('Vui lòng ghi rõ lý do khác!');return}reasonVal='Khác: '+otherR}var ei=parseInt(document.getElementById('rf_ei').value),isE=ei>=0;var lr=document.querySelector('input[name="rf_location"]:checked'),wr=document.querySelector('input[name="rf_workTime"]:checked');var rec={code:isE?D.r[ei].code:gc(),dept:document.getElementById('rf_dept').value,proposer:document.getElementById('rf_proposer').value.trim().toUpperCase(),position:document.getElementById('rf_position').value.trim(),level:document.getElementById('rf_level').value,qty:document.getElementById('rf_qty').value,types:[],reasons:[reasonVal],reason:reasonVal,startDate:document.getElementById('rf_startDate').value,reportTo:'',location:lr?lr.value:'',workTime:wr?wr.value:'',salary:'',salaryRange:'',jd:document.getElementById('rf_jd').value.trim(),responsibilities:'',environment:(document.getElementById('rf_environment')?document.getElementById('rf_environment').value.trim():''),requirements:(document.getElementById('rf_requirements')?document.getElementById('rf_requirements').value.trim():''),benefits:(document.getElementById('rf_benefits')?document.getElementById('rf_benefits').value.trim():''),edu:'',exp:'',major:'',skills:'',softSkills:'',language:'',cert:'',deadline:'',ap1:'',ap1s:'Chờ duyệt',ap2:'',ap2s:'Chờ duyệt',ap3:'',ap3s:'Chờ duyệt',dateStr:isE?D.r[ei].dateStr:fd(new Date()),iso:isE?D.r[ei].iso:gn(),opId:op.id,opName:op.name};if(isE){D.r[ei]=rec;log('Cập nhật NC',rec.code);alert('Cập nhật: '+rec.code)}else{D.r.push(rec);log('Tạo NC',rec.code);alert('Tạo: '+rec.code)}curRC=rec.code;saveToServer();rnRD(rec.code);show('recrDetailView')});

document.getElementById('candForm').addEventListener('submit',function(e){e.preventDefault();if(!valC()){var fe=this.querySelector('.error-msg[style*="block"]');if(fe)fe.scrollIntoView({behavior:'smooth',block:'center'});return}var sources=[];document.querySelectorAll('input[name="cf_src"]:checked').forEach(function(c){sources.push(c.value)});var ei=parseInt(document.getElementById('cf_ei').value),isE=ei>=0;var wishes=[document.getElementById('cf_wish1').value.trim(),document.getElementById('cf_wish2').value.trim(),document.getElementById('cf_wish3').value.trim()];var maritalR=document.querySelector('input[name="cf_marital"]:checked');var prevIVR=document.querySelector('input[name="cf_prevIV"]:checked');var availTimeR=document.querySelector('input[name="cf_availTime"]:checked');var smokeR=document.querySelector('input[name="cf_smoke"]:checked');var diseaseR=document.querySelector('input[name="cf_disease"]:checked');var busR=document.querySelector('input[name="cf_bus"]:checked');var rec={code:isE?D.c[ei].code:gcc(D.c.length+1),bophan:document.getElementById('cf_bophan').value,ivDate:document.getElementById('cf_ivDate').value,sobaodanh:document.getElementById('cf_sobaodanh').value.trim(),name:document.getElementById('cf_name').value.trim().toUpperCase(),dob:document.getElementById('cf_dob').value,gender:document.getElementById('cf_gender').value,ethnic:document.getElementById('cf_ethnic').value.trim(),marital:maritalR?maritalR.value:'',children:document.getElementById('cf_children').value,childAge:document.getElementById('cf_childAge').value.trim(),cccd:document.getElementById('cf_cccd').value.trim(),cccdDate:document.getElementById('cf_cccdDate').value,cccdPlace:document.getElementById('cf_cccdPlace').value.trim(),cccdExpiry:document.getElementById('cf_cccdExpiry').value,phone:document.getElementById('cf_phone').value.trim(),relativePhone:document.getElementById('cf_relativePhone').value.trim(),permAddr:document.getElementById('cf_permAddr').value.trim(),permWard:document.getElementById('cf_permWard').value.trim(),permCity:document.getElementById('cf_permCity').value.trim(),currAddr:document.getElementById('cf_currAddr').value.trim(),currWard:document.getElementById('cf_currWard').value.trim(),currCity:document.getElementById('cf_currCity').value.trim(),height:document.getElementById('cf_height').value,weight:document.getElementById('cf_weight').value,shoeSize:document.getElementById('cf_shoeSize').value.trim(),email:document.getElementById('cf_email').value.trim(),edu:document.getElementById('cf_edu').value,school:document.getElementById('cf_school').value.trim(),gradYear:document.getElementById('cf_gradYear').value.trim(),major:document.getElementById('cf_major').value.trim(),experiences:getExpData(),prevIV:prevIVR?prevIVR.value:'',prevIVTimes:document.getElementById('cf_prevIVTimes').value.trim(),prevIVWhen:document.getElementById('cf_prevIVWhen').value.trim(),availTime:availTimeR?availTimeR.value:'',availDate:document.getElementById('cf_availDate').value,availReason:document.getElementById('cf_availReason').value.trim(),smoke:smokeR?smokeR.value:'',disease:diseaseR?diseaseR.value:'',sources:sources,channel:document.getElementById('cf_channel').value.trim(),bus:busR?busR.value:'',busStop:document.getElementById('cf_busStop').value.trim(),chinese:document.getElementById('cf_chinese').value,english:document.getElementById('cf_english').value,expYears:document.getElementById('cf_expYears').value||0,wishes:wishes,position:wishes[0]||'',recrCode:'',iso:isE?D.c[ei].iso:gn(),opId:op.id,opName:op.name};var saveIdx;if(isE){D.c[ei]=rec;saveIdx=ei;log('Cập nhật UV',rec.code);alert('Cập nhật: '+rec.name)}else{D.c.push(rec);saveIdx=D.c.length-1;log('Thêm UV',rec.code);alert('Thêm: '+rec.name+' ('+rec.code+')')}if(pendingCV){cvStore[saveIdx]=pendingCV}else if(!pendingCV&&isE){delete cvStore[saveIdx]}saveToServer();rnCD(saveIdx);show('candDetailView')});

document.getElementById('schedForm').addEventListener('submit',function(e){e.preventDefault();if(!valSI()||!this.checkValidity()){this.reportValidity();return}var ci=parseInt(document.getElementById('si_ci').value),c=D.c[ci];var ei=parseInt(document.getElementById('si_ei').value),isE=ei>=0;var time=document.getElementById('si_time').value;if(checkDupIVTime(time,isE?ei:999)){document.getElementById('err_si_dup_time').style.display='block';alert('Trùng thời gian!');return}document.getElementById('err_si_dup_time').style.display='none';var tests=[];document.querySelectorAll('input[name="si_test"]:checked').forEach(function(cb){tests.push(cb.value)});var posName=document.getElementById('si_ivPosition').value.trim();var rec={code:isE?D.iv[ei].code:gic(),ci:ci,cc:c.code,cn:c.name,pos:posName,ivrN:document.getElementById('si_name').value.trim().toUpperCase(),ivrId:document.getElementById('si_id').value.trim(),ivrT:document.getElementById('si_title').value,time:time,location:document.getElementById('si_location').value,ivPositionCode:'',tests:tests,iso:isE?D.iv[ei].iso:gn(),opId:op.id,opName:op.name};if(isE){D.iv[ei]=rec;log('Cập nhật PV',rec.code);alert('Cập nhật: '+rec.code)}else{D.iv.push(rec);log('Đặt lịch PV',rec.code);alert('Đặt lịch: '+rec.code)}saveToServer();rnIV();show('ivListView')});

document.getElementById('rf_position').addEventListener('input',checkRecrDupLive);
document.getElementById('rf_dept').addEventListener('change',checkRecrDupLive);
function checkRecrDupLive(){var pos=document.getElementById('rf_position').value.trim(),dept=document.getElementById('rf_dept').value,ei=parseInt(document.getElementById('rf_ei').value);if(pos&&dept&&checkDupRecr(pos,dept,ei)){document.getElementById('rfDupWarn').style.display='flex';document.getElementById('rfDupMsg').textContent='Trùng: "'+pos+'" - "'+dept+'"'}else document.getElementById('rfDupWarn').style.display='none'}

initCVUpload();

// ============ LOAD DATA ON PAGE LOAD ============
loadFromServer(function(){
 console.log('Data loaded from server. RC='+RC+', IC='+IC+', candidates='+D.c.length);
});
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  // API: GET data
  if (req.method === 'GET' && req.url === '/api/data') {
    (async () => {
      try {
        const data = await readData();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    })();
    return;
  }

  // API: POST data
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });

    req.on('end', () => {
      (async () => {
        try {
          const data = JSON.parse(body || '{}');
          const ok = await writeData(data);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      })();
    });

    return;
  }

  // Serve HTML
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});