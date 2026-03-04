const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Toàn bộ nội dung HTML được nhúng trực tiếp
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hệ Thống Quản Lý Tuyển Dụng</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0f2f5;min-height:100vh;color:#333}
.view{display:none}.view.active{display:block}
.container{max-width:1200px;margin:0 auto;padding:20px}
.card{background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08);padding:28px;margin:16px auto;max-width:1100px}
h1,h2,h3{color:#2c3e50;margin-bottom:15px}
h1{text-align:center;font-size:1.8em;padding:24px 0 10px}
h2{font-size:1.4em;border-bottom:2px solid #3498db;padding-bottom:8px;margin-bottom:20px}
h3{font-size:1.1em;margin-top:16px;margin-bottom:10px}
.operator-bar{background:#fff;color:#333;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;border-bottom:2px solid #3498db;position:sticky;top:0;z-index:1000;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.operator-bar .operator-info{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.operator-bar .operator-info span{font-size:.9em}
.op-label{color:#7f8c8d;font-weight:600}
.op-value{color:#2c3e50;font-weight:700;background:#ecf0f1;padding:3px 10px;border-radius:6px}
.live-clock{font-size:1em;font-weight:700;color:#27ae60;background:#f0fff4;padding:6px 14px;border-radius:8px;font-family:'Courier New',monospace}
.change-operator-btn{background:#3498db;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:.85em;font-weight:600}
.search-filter-bar{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:10px;padding:16px 20px;margin-bottom:20px}
.search-filter-bar h3{margin:0 0 12px;color:#3498db;font-size:1em}
.filter-row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.filter-group{display:flex;flex-direction:column;gap:4px}
.filter-group label{font-size:.82em;font-weight:600;color:#2c3e50}
.filter-group input,.filter-group select{padding:8px 10px;border:1px solid #ddd;border-radius:8px;font-size:.88em;min-width:140px}
.filter-group input:focus,.filter-group select:focus{border-color:#3498db;outline:none}
.filter-btn{padding:8px 18px;font-size:.88em;font-weight:600;border:none;border-radius:8px;cursor:pointer;height:38px}
.filter-btn-search{background:#3498db;color:#fff}
.filter-btn-reset{background:#ecf0f1;color:#333}
.filter-btn-excel{background:#27ae60;color:#fff}
.search-result-info{margin-top:10px;font-size:.88em;color:#555;font-weight:500}
.search-result-info strong{color:#3498db}
.main-buttons{display:flex;flex-direction:column;gap:14px;max-width:600px;margin:30px auto}
.main-btn{display:block;width:100%;min-height:52px;padding:14px 24px;font-size:1.05em;font-weight:600;color:#fff;border:none;border-radius:10px;cursor:pointer;transition:all .3s;text-align:center}
.main-btn:nth-child(1){background:#3498db}
.main-btn:nth-child(2){background:#e74c3c}
.main-btn:nth-child(3){background:#2ecc71}
.main-btn:nth-child(4){background:#f39c12}
.main-btn:nth-child(5){background:#9b59b6}
.main-btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.15)}
.btn{display:inline-block;padding:10px 22px;font-size:.95em;font-weight:600;color:#fff;border:none;border-radius:8px;cursor:pointer;transition:all .3s;margin:4px}
.btn-primary{background:#3498db}.btn-success{background:#27ae60}.btn-warning{background:#e74c3c}.btn-info{background:#17a2b8}.btn-back{background:#95a5a6}.btn-export{background:#27ae60}.btn-danger{background:#e74c3c}.btn-pdf{background:#e74c3c}.btn-print{background:#8e44ad}.btn-edit{background:#f39c12;color:#fff}.btn-notify{background:#27ae60;color:#fff}.btn-excel{background:#1d6f42;color:#fff}
.btn:hover{transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.15)}
.form-group{margin-bottom:14px}
.form-group label{display:block;font-weight:600;margin-bottom:5px;color:#2c3e50;font-size:.93em}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:8px;font-size:.95em;font-family:inherit}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:#3498db;outline:none;box-shadow:0 0 0 3px rgba(52,152,219,.15)}
.form-group textarea{min-height:70px;resize:vertical}
.form-row{display:flex;gap:14px;flex-wrap:wrap}
.form-row .form-group{flex:1;min-width:180px}
.checkbox-group{display:flex;flex-wrap:wrap;gap:12px;margin:6px 0}
.checkbox-group label{display:flex;align-items:center;gap:6px;font-weight:400;cursor:pointer;font-size:.93em;background:#f8f9fa;padding:6px 12px;border-radius:6px;border:1px solid #e0e0e0}
.checkbox-group label:hover{background:#e8f4fd;border-color:#3498db}
.checkbox-group input[type="checkbox"],.checkbox-group input[type="radio"]{width:18px;height:18px;accent-color:#3498db}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.9em}
thead th{background:#3498db;color:#fff;padding:12px 10px;text-align:left;font-weight:600;white-space:nowrap}
tbody td{padding:10px;border-bottom:1px solid #e8e8e8}
tbody tr:nth-child(even){background:#f8f9fa}
tbody tr:hover{background:#e8f4fd}
.code-link{color:#3498db;text-decoration:underline;cursor:pointer;font-weight:600}
.code-link:hover{color:#2980b9}
.section-title{background:#e8f4fd;padding:12px 18px;border-radius:8px;margin:22px 0 14px;font-weight:700;color:#2c3e50;font-size:1.05em;border-left:4px solid #3498db}
.approval-section{display:flex;gap:20px;flex-wrap:wrap;margin:16px 0}
.approval-box{flex:1;min-width:200px;background:#f8f9fa;border:1px solid #ddd;border-radius:10px;padding:16px;text-align:center}
.approval-box h4{margin-bottom:10px;color:#2c3e50}
.badge{display:inline-block;padding:4px 10px;border-radius:12px;font-size:.82em;font-weight:600}
.badge-pending{background:#fff3cd;color:#856404}
.badge-approved{background:#d4edda;color:#155724}
.badge-pass{background:#d4edda;color:#155724}
.badge-fail{background:#f8d7da;color:#721c24}
.badge-confirmed{background:#cce5ff;color:#004085}
.badge-notified{background:#d1ecf1;color:#0c5460}
.badge-ia{background:#e8daef;color:#6c3483}
.detail-grid{display:grid;grid-template-columns:220px 1fr;gap:8px 16px;margin:12px 0}
.detail-grid .label{font-weight:600;color:#2c3e50}
.detail-grid .value{color:#555}
.actions-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px}
.error-msg{color:#dc3545;font-size:.85em;margin-top:4px;display:none;font-weight:500}
.table-wrapper{overflow-x:auto}
.commitment-box{background:#e8f4fd;border:1px solid #b8daff;border-radius:10px;padding:18px;margin:18px 0}
.commitment-box label{font-weight:600;cursor:pointer;display:flex;align-items:flex-start;gap:10px;line-height:1.5}
.commitment-box input[type="checkbox"]{width:20px;height:20px;margin-top:2px;accent-color:#3498db;flex-shrink:0}
.candidate-detail-card{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:10px;padding:18px;margin:12px 0}
.required-star{color:#dc3545;font-weight:700}
.info-note{background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px 14px;margin:10px 0;font-size:.9em;color:#856404}
.login-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;justify-content:center;align-items:center;z-index:9999}
.login-modal{background:#fff;border-radius:16px;padding:40px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);text-align:center}
.login-modal h2{border:none;text-align:center;margin-bottom:8px}
.login-modal p{color:#666;margin-bottom:20px;font-size:.9em}
.login-modal .form-group{text-align:left}
.login-modal .login-btn{width:100%;padding:14px;font-size:1.1em;font-weight:700;background:#3498db;color:#fff;border:none;border-radius:10px;cursor:pointer;margin-top:10px}
.login-error{color:#dc3545;font-size:.85em;margin-top:8px;display:none}
.modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:none;justify-content:center;align-items:center;z-index:5000}
.modal-overlay.active{display:flex}
.modal-content{background:#fff;border-radius:14px;padding:30px;max-width:900px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.print-area{background:#fff;padding:40px;font-family:'Times New Roman',serif;color:#000;line-height:1.6}
.print-area h2{color:#000;border-bottom:2px solid #000;font-size:1.3em;text-align:center}
.print-area table{border:1px solid #000}
.print-area table th{background:#e0e0e0;color:#000;border:1px solid #000;padding:8px}
.print-area table td{border:1px solid #000;padding:8px}
.print-area .print-footer{margin-top:30px;display:flex;justify-content:space-between}
.print-area .print-footer div{text-align:center;min-width:200px}
.edit-mode-banner{background:#f39c12;color:#fff;padding:10px 18px;border-radius:8px;margin-bottom:16px;font-weight:700;display:flex;align-items:center;gap:10px}
.uppercase-input{text-transform:uppercase}
.score-display{background:#fff;border:2px solid #3498db;border-radius:10px;padding:14px;text-align:center;margin:10px 0}
.score-display .score-value{font-size:2em;font-weight:800;color:#3498db}
.score-display .score-label{font-size:.85em;color:#888}
.checklist-section{background:#f8f9fa;border:1px solid #ddd;border-radius:12px;padding:20px;margin:16px 0}
.checklist-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid #e8e8e8}
.checklist-item:last-child{border-bottom:none}
.checklist-item input[type="checkbox"]{width:20px;height:20px;accent-color:#27ae60}
.checklist-item label{font-size:.93em;cursor:pointer;flex:1}
.notify-section{background:#f0fff4;border:1px solid #27ae60;border-radius:12px;padding:20px;margin:16px 0}
.notify-section h3{color:#1e8449;margin-bottom:14px}
.dup-warning{background:#f8d7da;border:1px solid #e74c3c;border-radius:8px;padding:10px 14px;margin:8px 0;font-size:.9em;color:#721c24;display:flex;align-items:center;gap:8px}
.dup-warning .dup-icon{font-size:1.2em}
.eval-table{width:100%;border-collapse:collapse;margin:10px 0}
.eval-table th,.eval-table td{border:1px solid #ddd;padding:10px;text-align:left}
.eval-table th{background:#e8f4fd;color:#2c3e50;font-weight:600}
.eval-table select{padding:6px;border-radius:6px;border:1px solid #ddd;min-width:80px}
.eval-table textarea{width:100%;min-height:40px;padding:6px;border:1px solid #ddd;border-radius:6px;font-family:inherit;font-size:.85em;resize:vertical}
.cv-upload-area{border:2px dashed #3498db;border-radius:10px;padding:24px;text-align:center;background:#f8f9ff;cursor:pointer;transition:all .3s}
.cv-upload-area:hover{background:#e8f4fd;border-color:#2980b9}
.cv-upload-area .cv-icon{font-size:2.5em;margin-bottom:8px}
.cv-upload-area p{color:#555;font-size:.9em;margin:4px 0}
.cv-upload-area .cv-hint{color:#999;font-size:.8em}
.cv-preview{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;background:#d4edda;border-radius:8px;margin-top:10px;font-weight:600;color:#155724;max-width:100%;word-break:break-all}
.cv-preview a{color:#155724;text-decoration:underline;cursor:pointer;font-weight:700}
.cv-preview a:hover{color:#0d6e2e}
.cv-preview .cv-remove{background:#e74c3c;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.8em;font-weight:600;margin-left:8px;flex-shrink:0}
.cv-preview .cv-remove:hover{background:#c0392b}
.cv-preview .cv-size{color:#6c757d;font-size:.8em;font-weight:400}
.exp-table{width:100%;border-collapse:collapse;margin:10px 0}
.exp-table th,.exp-table td{border:1px solid #ddd;padding:8px;text-align:left;font-size:.88em}
.exp-table th{background:#e8f4fd;color:#2c3e50;font-weight:600}
.exp-table input,.exp-table select{width:100%;padding:6px;border:1px solid #ddd;border-radius:4px;font-size:.85em;font-family:inherit}
.exp-table .remove-row{background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:.8em}
.add-row-btn{background:#27ae60;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.88em;font-weight:600;margin-top:8px}
.add-row-btn:hover{background:#219a52}
.se-form{font-family:'Times New Roman',serif;color:#000;line-height:1.5;font-size:13px}
.se-form .se-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.se-form .se-logo{font-weight:900;font-size:20px;font-family:Arial,sans-serif}
.se-form .se-title{text-align:center;font-size:16px;font-weight:700;flex:1}
.se-form .se-date-box{border:1px solid #000;padding:6px 10px;font-size:12px;text-align:right}
.se-form table.se-table{width:100%;border-collapse:collapse;margin:4px 0}
.se-form table.se-table td,.se-form table.se-table th{border:1px solid #000;padding:5px 8px;font-size:12px;vertical-align:top}
.se-form .se-section{font-weight:700;margin:10px 0 4px;font-size:13px}
.se-form .se-field{margin:3px 0;font-size:12px}
.se-form .se-field .se-label{font-weight:600}
.se-form .se-field .se-val{border-bottom:1px dotted #000;display:inline-block;min-width:120px;padding:0 4px}
.se-form .se-check{display:inline-block;width:14px;height:14px;border:1px solid #000;text-align:center;font-size:10px;line-height:14px;margin-right:4px;vertical-align:middle}
.se-form .se-footer{margin-top:16px;display:flex;justify-content:space-between;font-size:12px}
.se-form .se-footer div{text-align:center;min-width:180px}
.se-form .se-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px}
.se-form .se-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px 12px}
.op-stamp{font-size:.75em;color:#888;font-style:italic}
@media(max-width:768px){.form-row{flex-direction:column}.detail-grid{grid-template-columns:1fr}.approval-section{flex-direction:column}.card{padding:16px;margin:10px}h1{font-size:1.4em}.operator-bar{flex-direction:column;text-align:center}.filter-row{flex-direction:column}}
</style>
</head>
<body>
<!-- LOGIN -->
<div id="loginOverlay" class="login-overlay">
<div class="login-modal">
<h2>🔐 Đăng Nhập</h2>
<p>Nhập thông tin nhân viên</p>
<form id="loginForm">
<div class="form-group"><label>Mã NV <span class="required-star">*</span></label><input type="text" id="login_empId" required placeholder="NV001"></div>
<div class="form-group"><label>Họ tên <span class="required-star">*</span> (IN HOA)</label><input type="text" id="login_empName" required placeholder="NGUYỄN VĂN A" class="uppercase-input"></div>
<div class="form-group"><label>Phòng ban <span class="required-star">*</span></label>
<select id="login_empDept" required><option value="">-- Chọn --</option><option>Sản xuất 2.1</option><option>Sản xuất 2.2</option><option>Sản xuất 3</option><option>Sản xuất 4</option><option>Kiểm tra 1</option><option>Kiểm tra 2</option><option>Phòng Nhân sự</option><option>Ban Giám Đốc</option></select></div>
<div class="form-group"><label>Chức vụ <span class="required-star">*</span></label>
<select id="login_empTitle" required><option value="">-- Chọn --</option><option>Nhân viên</option><option>Kỹ sư</option><option>Trưởng nhóm</option><option>Quản lý</option><option>Giám đốc</option></select></div>
<div class="login-error" id="loginError">Vui lòng điền đầy đủ. Họ tên phải IN HOA.</div>
<button type="submit" class="login-btn">Đăng nhập</button>
</form>
</div>
</div>
<!-- OPERATOR BAR -->
<div id="operatorBar" class="operator-bar" style="display:none">
<div class="operator-info">
<span>👤 <span class="op-label">Mã NV:</span> <span class="op-value" id="dispEmpId">-</span></span>
<span><span class="op-label">Họ tên:</span> <span class="op-value" id="dispEmpName">-</span></span>
<span><span class="op-label">Phòng ban:</span> <span class="op-value" id="dispEmpDept">-</span></span>
<span><span class="op-label">Chức vụ:</span> <span class="op-value" id="dispEmpTitle">-</span></span>
<button class="change-operator-btn" id="btnChangeOp">🔄 Đổi</button>
</div>
<div class="live-clock" id="liveClock">--:--:--</div>
</div>
<!-- PDF Modal -->
<div id="pdfModal" class="modal-overlay">
<div class="modal-content">
<div class="actions-bar">
<h2>📄 Xem trước</h2>
<div><button class="btn btn-pdf" id="btnDLPDF">📥 Tải PDF</button><button class="btn btn-print" id="btnPrint">🖨 In</button><button class="btn btn-back" id="btnClosePDF">✕ Đóng</button></div>
</div>
<div id="pdfContent" class="print-area"></div>
</div>
</div>
<!-- EVALUATION MODAL -->
<div id="iaModal" class="modal-overlay">
<div class="modal-content">
<div class="actions-bar">
<h2>📋 Phiếu Đánh Giá Ứng Viên</h2>
<button class="btn btn-back" id="btnCloseIA">✕ Đóng</button>
</div>
<form id="iaForm">
<input type="hidden" id="ia_ivCode" value="">
<div class="candidate-detail-card" id="iaCandidate"></div>
<div class="section-title">I. Đánh giá chuyên môn (Technical Competency)</div>
<table class="eval-table">
<thead><tr><th style="width:30%">Tiêu chí</th><th style="width:15%">Điểm (1-5)</th><th>Nhận xét</th></tr></thead>
<tbody>
<tr><td>Kiến thức chuyên môn</td><td><select id="ia_knowledge" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_knowledge_note"></textarea></td></tr>
<tr><td>Kinh nghiệm thực tế</td><td><select id="ia_experience" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_experience_note"></textarea></td></tr>
<tr><td>Khả năng giải quyết vấn đề</td><td><select id="ia_problem" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_problem_note"></textarea></td></tr>
<tr><td>Tư duy logic / phân tích</td><td><select id="ia_logic" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_logic_note"></textarea></td></tr>
<tr><td>Kỹ năng sử dụng công cụ/phần mềm</td><td><select id="ia_tools" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_tools_note"></textarea></td></tr>
</tbody>
</table>
<div class="score-display"><div class="score-label">Tổng điểm chuyên môn</div><div class="score-value" id="iaTechScore">- / 25</div></div>
<div class="section-title">II. Đánh giá kỹ năng & thái độ (Soft Skills & Attitude)</div>
<table class="eval-table">
<thead><tr><th style="width:30%">Tiêu chí</th><th style="width:15%">Điểm (1-5)</th><th>Nhận xét</th></tr></thead>
<tbody>
<tr><td>Giao tiếp</td><td><select id="ia_communication" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_communication_note"></textarea></td></tr>
<tr><td>Làm việc nhóm</td><td><select id="ia_teamwork" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_teamwork_note"></textarea></td></tr>
<tr><td>Chủ động & trách nhiệm</td><td><select id="ia_attitude" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_attitude_note"></textarea></td></tr>
<tr><td>Khả năng học hỏi</td><td><select id="ia_learning" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_learning_note"></textarea></td></tr>
<tr><td>Phù hợp văn hóa công ty</td><td><select id="ia_culture" required><option value="">--</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td><td><textarea id="ia_culture_note"></textarea></td></tr>
</tbody>
</table>
<div class="score-display"><div class="score-label">Tổng điểm kỹ năng</div><div class="score-value" id="iaSoftScore">- / 25</div></div>
<div class="section-title">III. Đánh giá tổng thể</div>
<div class="score-display"><div class="score-label">Điểm tổng</div><div class="score-value" id="iaTotalScore">- / 50</div></div>
<div class="form-group"><label>Mức độ phù hợp <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="ia_fit" value="Rất phù hợp" required> Rất phù hợp</label>
<label><input type="radio" name="ia_fit" value="Phù hợp"> Phù hợp</label>
<label><input type="radio" name="ia_fit" value="Cần cân nhắc"> Cần cân nhắc</label>
<label><input type="radio" name="ia_fit" value="Không phù hợp"> Không phù hợp</label>
</div></div>
<div class="form-row">
<div class="form-group"><label>Đề xuất lương (nếu đạt)</label><input type="text" id="ia_proposedSalary" placeholder="VD: 15,000,000 VNĐ"></div>
<div class="form-group"><label>Thời gian có thể nhận việc</label><input type="date" id="ia_availDate"></div>
</div>
<div class="section-title">IV. Kết luận</div>
<div class="form-group"><label>Kết luận <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="ia_conclusion" value="Đề xuất tuyển" required> Đề xuất tuyển</label>
<label><input type="radio" name="ia_conclusion" value="Đề xuất dự bị"> Đề xuất dự bị</label>
<label><input type="radio" name="ia_conclusion" value="Không tuyển"> Không tuyển</label>
</div></div>
<div class="form-group"><label>Nhận xét tổng kết <span class="required-star">*</span></label><textarea id="ia_comment" required rows="3" placeholder="Nhận xét chung về ứng viên..."></textarea></div>
<div class="form-row">
<div class="form-group"><label>Người đánh giá (IN HOA) <span class="required-star">*</span></label><input type="text" id="ia_evaluator" required class="uppercase-input"></div>
<div class="form-group"><label>Chức vụ <span class="required-star">*</span></label><input type="text" id="ia_evalTitle" required></div>
</div>
<div style="text-align:center;margin-top:20px"><button type="submit" class="btn btn-primary" style="min-width:260px;min-height:48px">📁 Lưu Phiếu Đánh Giá</button></div>
</form>
</div>
</div>
<!-- NOTIFY MODAL -->
<div id="notifyModal" class="modal-overlay">
<div class="modal-content">
<div class="actions-bar">
<h2>📧 Thông Báo Trúng Tuyển</h2>
<button class="btn btn-back" id="btnCloseNotify">✕ Đóng</button>
</div>
<form id="notifyForm">
<input type="hidden" id="nf_ivCode" value="">
<div class="candidate-detail-card" id="nfCandidate"></div>
<div class="notify-section">
<h3>📋 Thông tin trúng tuyển</h3>
<div class="form-row">
<div class="form-group"><label>Vị trí <span class="required-star">*</span></label><input type="text" id="nf_position" required readonly></div>
<div class="form-group"><label>Phòng ban <span class="required-star">*</span></label><input type="text" id="nf_dept" required readonly></div>
</div>
<div class="form-row">
<div class="form-group"><label>Lương thử việc <span class="required-star">*</span></label><input type="text" id="nf_trialSalary" required placeholder="VD: 10,000,000 VNĐ"></div>
<div class="form-group"><label>Lương chính thức <span class="required-star">*</span></label><input type="text" id="nf_salary" required placeholder="VD: 15,000,000 VNĐ"></div>
</div>
<div class="form-group"><label>Phụ cấp</label>
<div class="checkbox-group">
<label><input type="checkbox" name="nf_allowance" value="Ăn ca"> Ăn ca</label>
<label><input type="checkbox" name="nf_allowance" value="Chuyên cần"> Chuyên cần</label>
<label><input type="checkbox" name="nf_allowance" value="Nhà ở"> Nhà ở</label>
<label><input type="checkbox" name="nf_allowance" value="Khác"> Khác</label>
</div></div>
<div class="form-row">
<div class="form-group"><label>Mức lương đóng BH</label><input type="text" id="nf_bhSalary" placeholder="VD: 5,000,000"></div>
<div class="form-group"><label>Hình thức trả lương <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="nf_payMethod" value="Chuyển khoản" required> Chuyển khoản</label>
<label><input type="radio" name="nf_payMethod" value="Tiền mặt"> Tiền mặt</label>
</div></div>
</div>
<div class="form-row">
<div class="form-group"><label>Ngày bắt đầu <span class="required-star">*</span></label><input type="date" id="nf_startDate" required></div>
<div class="form-group"><label>Hạn phản hồi <span class="required-star">*</span></label><input type="date" id="nf_deadline" required></div>
</div>
<div class="section-title">🚌 Xe bus</div>
<div class="form-group"><label><input type="checkbox" id="nf_busRegister"> Đăng ký xe bus</label></div>
<div class="form-row" id="nf_busDetails" style="display:none">
<div class="form-group"><label>Tuyến xe</label><input type="text" id="nf_busRoute"></div>
<div class="form-group"><label>Điểm đón/trả</label><input type="text" id="nf_busStop"></div>
</div>
<div class="form-group"><label>Ghi chú</label><textarea id="nf_note" rows="2"></textarea></div>
</div>
<div style="text-align:center;margin-top:20px"><button type="submit" class="btn btn-notify" style="min-width:260px;min-height:48px">📧 Gửi Thông Báo</button></div>
</form>
</div>
</div>
<!-- ONBOARDING FORM MODAL -->
<div id="obFormModal" class="modal-overlay">
<div class="modal-content">
<div class="actions-bar">
<h2>✅ Cập Nhật NV Mới</h2>
<button class="btn btn-back" id="btnCloseOBForm">✕ Đóng</button>
</div>
<form id="obForm">
<input type="hidden" id="ob_idx" value="">
<div class="candidate-detail-card" id="obCandInfo"></div>
<div class="section-title">I. Thông tin cá nhân bổ sung</div>
<div class="form-row">
<div class="form-group"><label>Họ tên</label><input type="text" id="ob_name" readonly class="uppercase-input"></div>
<div class="form-group"><label>Mã nhân viên <span class="required-star">*</span></label><input type="text" id="ob_empId" required placeholder="NV-2025-XXX"></div>
<div class="form-group"><label>Ngày nhận việc <span class="required-star">*</span></label><input type="date" id="ob_startDate" required></div>
</div>
<div class="form-row">
<div class="form-group"><label>SĐT</label><input type="text" id="ob_phone"></div>
<div class="form-group"><label>Email</label><input type="email" id="ob_personalEmail"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Hôn nhân</label><select id="ob_marital"><option value="">--</option><option>Độc thân</option><option>Đã kết hôn</option><option>Ly hôn</option></select></div>
<div class="form-group"><label>Số người phụ thuộc</label><input type="number" id="ob_dependants" min="0" value="0"></div>
</div>
<div class="section-title">II. BHXH & Thuế</div>
<div class="form-group"><label>Đã tham gia BHXH?</label>
<div class="checkbox-group"><label><input type="radio" name="ob_bhxh" value="Chưa"> Chưa</label><label><input type="radio" name="ob_bhxh" value="Rồi"> Rồi</label></div></div>
<div class="form-row">
<div class="form-group"><label>Số sổ BHXH</label><input type="text" id="ob_bhxhNo"></div>
<div class="form-group"><label>Nơi KCB</label><input type="text" id="ob_hospital"></div>
</div>
<div class="form-row">
<div class="form-group"><label>MST cá nhân</label><input type="text" id="ob_taxCode"></div>
<div class="form-group"><label>Giảm trừ gia cảnh</label>
<div class="checkbox-group"><label><input type="radio" name="ob_taxDeduct" value="Có"> Có</label><label><input type="radio" name="ob_taxDeduct" value="Không"> Không</label></div></div>
</div>
<div class="section-title">III. Liên hệ khẩn cấp</div>
<div class="form-row">
<div class="form-group"><label>Họ tên</label><input type="text" id="ob_emgName" class="uppercase-input"></div>
<div class="form-group"><label>Quan hệ</label><input type="text" id="ob_emgRelation"></div>
</div>
<div class="form-row">
<div class="form-group"><label>SĐT</label><input type="text" id="ob_emgPhone"></div>
<div class="form-group"><label>Địa chỉ</label><input type="text" id="ob_emgAddr"></div>
</div>
<div class="section-title">IV. Ngân hàng</div>
<div class="form-row">
<div class="form-group"><label>Ngân hàng</label><input type="text" id="ob_bankName"></div>
<div class="form-group"><label>Chi nhánh</label><input type="text" id="ob_bankBranch"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Số TK</label><input type="text" id="ob_bankAccount"></div>
<div class="form-group"><label>Chủ TK</label><input type="text" id="ob_bankOwner" class="uppercase-input"></div>
</div>
<div class="section-title">V. Hồ sơ đã nộp</div>
<div class="checklist-section" id="obChecklist">
<div class="checklist-item"><input type="checkbox" id="ck_cccd"><label for="ck_cccd">CCCD công chứng</label></div>
<div class="checklist-item"><input type="checkbox" id="ck_cv2"><label for="ck_cv2">Sơ yếu lý lịch</label></div>
<div class="checklist-item"><input type="checkbox" id="ck_health"><label for="ck_health">Giấy khám sức khỏe</label></div>
<div class="checklist-item"><input type="checkbox" id="ck_degree"><label for="ck_degree">Bằng cấp / Chứng chỉ</label></div>
<div class="checklist-item"><input type="checkbox" id="ck_birth"><label for="ck_birth">Giấy khai sinh</label></div>
</div>
<div class="form-group"><label>Ghi chú hồ sơ thiếu</label><textarea id="ob_missingNote" rows="2"></textarea></div>
<div class="commitment-box"><label><input type="checkbox" id="ob_confirm" required> Tôi xác nhận thông tin đã cập nhật đầy đủ.</label></div>
<div style="text-align:center;margin-top:20px"><button type="submit" class="btn btn-success" style="min-width:260px;min-height:48px">✅ Xác Nhận</button></div>
</form>
</div>
</div>
<!-- ========== VIEWS ========== -->
<!-- MAIN -->
<div id="mainView" class="view">
<div class="container">
<h1>Hệ Thống Quản Lý Tuyển Dụng</h1>
<div class="main-buttons">
<button class="main-btn" id="btnGoRecr">📋 Nhu cầu tuyển dụng</button>
<button class="main-btn" id="btnGoCand">👤 Thông tin ứng viên</button>
<button class="main-btn" id="btnGoIV">📅 Lịch phỏng vấn</button>
<button class="main-btn" id="btnGoRes">📊 Kết quả phỏng vấn</button>
<button class="main-btn" id="btnGoOB">✅ Nhân viên mới nhận việc</button>
</div>
</div>
</div>
<!-- RECRUITMENT LIST -->
<div id="recrListView" class="view">
<div class="container"><div class="card">
<div class="actions-bar">
<h2>Danh Sách Nhu Cầu Tuyển Dụng</h2>
<div><button class="btn btn-back" id="btnBackRecrList">←</button><button class="btn btn-primary" id="btnNewRecr">+ Tạo mới</button><button class="btn btn-pdf" id="btnPDFRecrList">📄 PDF</button><button class="btn btn-excel" id="btnExcelRL">📊 Excel</button></div>
</div>
<div class="search-filter-bar"><h3>🔍 Tìm kiếm</h3>
<div class="filter-row">
<div class="filter-group"><label>Từ ngày</label><input type="date" id="fR_from"></div>
<div class="filter-group"><label>Đến ngày</label><input type="date" id="fR_to"></div>
<div class="filter-group"><label>Mã</label><input type="text" id="fR_code"></div>
<button class="filter-btn filter-btn-search" id="btnFR">🔍</button><button class="filter-btn filter-btn-reset" id="btnRR">↻</button>
</div><div class="search-result-info" id="rInfo"></div>
</div>
<div class="table-wrapper"><table><thead><tr><th>Mã</th><th>Phòng ban</th><th>Vị trí</th><th>SL</th><th>Người ĐX</th><th>Địa điểm</th><th>Ngày tạo</th><th>TT</th><th>Người TT</th><th>Thời gian TT</th><th>Thao tác</th></tr></thead><tbody id="rTB"></tbody></table></div>
</div></div>
</div>
<!-- RECRUITMENT FORM -->
<div id="recrFormView" class="view">
<div class="container"><div class="card">
<div class="actions-bar">
<h2 id="rfTitle">Tạo Nhu Cầu Tuyển Dụng</h2>
<button class="btn btn-back" id="btnBackRF">←</button>
</div>
<div id="rfBanner" class="edit-mode-banner" style="display:none">🖊 Chỉnh sửa: <span id="rfCode"></span></div>
<div id="rfDupWarn" class="dup-warning" style="display:none"><span class="dup-icon">⚠</span><span id="rfDupMsg"></span></div>
<form id="recrForm">
<input type="hidden" id="rf_ei" value="-1">
<div class="section-title">I. Thông tin chung</div>
<div class="form-row">
<div class="form-group"><label>Phòng ban <span class="required-star">*</span></label>
<select id="rf_dept" required><option value="">--</option><option>Sản xuất 2.1</option><option>Sản xuất 2.2</option><option>Sản xuất 3</option><option>Sản xuất 4</option><option>Kiểm tra 1</option><option>Kiểm tra 2</option></select></div>
<div class="form-group"><label>Người đề xuất <span class="required-star">*</span> (IN HOA)</label><input type="text" id="rf_proposer" required class="uppercase-input"><div class="error-msg" id="err_rf_proposer">Phải IN HOA</div></div>
</div>
<div class="form-row">
<div class="form-group"><label>Vị trí <span class="required-star">*</span></label><input type="text" id="rf_position" required></div>
<div class="form-group"><label>Cấp bậc <span class="required-star">*</span></label><select id="rf_level" required><option value="">--</option><option>Nhân viên</option><option>Kỹ sư</option><option>Trưởng nhóm</option><option>Quản lý</option><option>Giám đốc</option></select></div>
<div class="form-group"><label>Số lượng <span class="required-star">*</span></label><input type="number" id="rf_qty" min="1" required value="1"></div>
</div>
<div class="form-group"><label>Loại hình <span class="required-star">*</span></label>
<div class="checkbox-group"><label><input type="checkbox" name="rf_type" value="Tuyển mới"> Tuyển mới</label><label><input type="checkbox" name="rf_type" value="Thay thế"> Thay thế</label></div>
<div class="error-msg" id="err_rf_type">Chọn ít nhất 1</div></div>
<div class="form-group"><label>Lý do <span class="required-star">*</span></label>
<div class="checkbox-group"><label><input type="checkbox" name="rf_reason" value="Nghỉ việc"> Nghỉ việc</label><label><input type="checkbox" name="rf_reason" value="Mở rộng"> Mở rộng</label></div>
<div class="error-msg" id="err_rf_reason">Chọn ít nhất 1</div></div>
<div class="form-group"><label>Onboard date <span class="required-star">*</span></label><input type="date" id="rf_startDate" required></div>
<div class="section-title">II. Thông tin chi tiết</div>
<div class="form-group"><label>Báo cáo cho (Report to)</label><input type="text" id="rf_reportTo" class="uppercase-input"></div>
<div class="form-group"><label>Địa điểm <span class="required-star">*</span></label>
<div class="checkbox-group"><label><input type="radio" name="rf_location" value="Nhà máy 1" required> NM1</label><label><input type="radio" name="rf_location" value="Nhà máy 2"> NM2</label><label><input type="radio" name="rf_location" value="Nhà máy 3"> NM3</label><label><input type="radio" name="rf_location" value="Nhà máy 4"> NM4</label></div></div>
<div class="form-group"><label>Thời gian LV <span class="required-star">*</span></label>
<div class="checkbox-group"><label><input type="radio" name="rf_workTime" value="Hành chính" required> HC</label><label><input type="radio" name="rf_workTime" value="HC kíp"> HC kíp</label><label><input type="radio" name="rf_workTime" value="2 ca"> 2 ca</label><label><input type="radio" name="rf_workTime" value="3 ca"> 3 ca</label><label><input type="radio" name="rf_workTime" value="3 ca kíp"> 3 ca kíp</label></div></div>
<div class="form-row">
<div class="form-group"><label>Mức lương <span class="required-star">*</span></label><input type="text" id="rf_salary" required placeholder="10,000,000 - 15,000,000"></div>
<div class="form-group"><label>Dải lương</label><input type="text" id="rf_salaryRange"></div>
</div>
<div class="form-group"><label>Mục tiêu CV <span class="required-star">*</span></label><textarea id="rf_jd" required></textarea></div>
<div class="form-group"><label>Nhiệm vụ chính <span class="required-star">*</span></label><textarea id="rf_responsibilities" required></textarea></div>
<div class="form-row">
<div class="form-group"><label>Trình độ <span class="required-star">*</span></label><select id="rf_edu" required><option value="">--</option><option>Trung cấp</option><option>Cao đẳng</option><option>Đại học</option><option>Thạc sĩ</option><option>Tiến sĩ</option></select></div>
<div class="form-group"><label>Chuyên ngành</label><input type="text" id="rf_major"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Kinh nghiệm <span class="required-star">*</span></label><select id="rf_exp" required><option value="">--</option><option>Không YC</option><option>Dưới 1 năm</option><option>1-3 năm</option><option>3-5 năm</option><option>Trên 5 năm</option></select></div>
<div class="form-group"><label>Deadline</label><input type="date" id="rf_deadline"></div>
</div>
<div class="form-group"><label>Kỹ năng CM</label><textarea id="rf_skills"></textarea></div>
<div class="form-group"><label>Kỹ năng mềm</label><textarea id="rf_softSkills"></textarea></div>
<div class="form-row">
<div class="form-group"><label>Ngoại ngữ</label><input type="text" id="rf_language"></div>
<div class="form-group"><label>Chứng chỉ</label><input type="text" id="rf_cert"></div>
</div>
<div class="section-title">III. Phê duyệt</div>
<div class="approval-section">
<div class="approval-box"><h4>Trưởng phòng</h4><div class="form-group"><label style="font-size:.82em">Họ tên</label><input type="text" id="rf_ap1" class="uppercase-input"></div><div class="form-group"><select id="rf_ap1s"><option value="Chờ duyệt">Chờ duyệt</option><option value="Đã duyệt">Đã duyệt</option><option value="Từ chối">Từ chối</option></select></div></div>
<div class="approval-box"><h4>HR Manager</h4><div class="form-group"><label style="font-size:.82em">Họ tên</label><input type="text" id="rf_ap2" class="uppercase-input"></div><div class="form-group"><select id="rf_ap2s"><option value="Chờ duyệt">Chờ duyệt</option><option value="Đã duyệt">Đã duyệt</option><option value="Từ chối">Từ chối</option></select></div></div>
<div class="approval-box"><h4>Ban GĐ</h4><div class="form-group"><label style="font-size:.82em">Họ tên</label><input type="text" id="rf_ap3" class="uppercase-input"></div><div class="form-group"><select id="rf_ap3s"><option value="Chờ duyệt">Chờ duyệt</option><option value="Đã duyệt">Đã duyệt</option><option value="Từ chối">Từ chối</option></select></div></div>
</div>
<div style="text-align:center;margin-top:24px"><button type="submit" class="btn btn-primary" style="min-width:220px;min-height:48px" id="rfBtn">💾 Lưu</button></div>
</form>
</div></div>
</div>
<!-- RECRUITMENT DETAIL -->
<div id="recrDetailView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>📋 Chi Tiết</h2><div><button class="btn btn-back" id="btnBackRD">←</button><button class="btn btn-edit" id="btnEditR">🖊</button><button class="btn btn-pdf" id="btnPDFRD">📄</button><button class="btn btn-print" id="btnPrintRD">🖨</button></div></div>
<div id="rdContent"></div>
</div></div>
</div>
<!-- CANDIDATE LIST -->
<div id="candListView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>Danh Sách Ứng Viên</h2><div><button class="btn btn-back" id="btnBackCL">←</button><button class="btn btn-primary" id="btnNewCand">+ Thêm</button><button class="btn btn-pdf" id="btnPDFCL">📄</button><button class="btn btn-excel" id="btnExcelCL">📊 Excel</button></div></div>
<div class="search-filter-bar"><h3>🔍 Tìm kiếm</h3>
<div class="filter-row">
<div class="filter-group"><label>Từ ngày</label><input type="date" id="fC_from"></div>
<div class="filter-group"><label>Đến ngày</label><input type="date" id="fC_to"></div>
<div class="filter-group"><label>Họ tên</label><input type="text" id="fC_name"></div>
<div class="filter-group"><label>SĐT</label><input type="text" id="fC_phone"></div>
<div class="filter-group"><label>CCCD</label><input type="text" id="fC_cccd"></div>
<button class="filter-btn filter-btn-search" id="btnFC">🔍</button><button class="filter-btn filter-btn-reset" id="btnRC">↻</button>
</div><div class="search-result-info" id="cInfo"></div>
</div>
<div class="table-wrapper"><table><thead><tr><th>Mã</th><th>Họ tên</th><th>SĐT</th><th>Email</th><th>CV</th><th>Vị trí 1</th><th>Vị trí 2</th><th>Vị trí 3</th><th>Người TT</th><th>Thời gian TT</th><th>Thao tác</th></tr></thead><tbody id="cTB"></tbody></table></div>
</div></div>
</div>
<!-- CANDIDATE FORM -->
<div id="candFormView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2 id="cfTitle">THÔNG TIN TRƯỚC PHỎNG VẤN</h2><button class="btn btn-back" id="btnBackCF">←</button></div>
<div id="cfBanner" class="edit-mode-banner" style="display:none">🖊 Chỉnh sửa: <span id="cfCode"></span></div>
<form id="candForm" novalidate>
<input type="hidden" id="cf_ei" value="-1">
<div class="section-title">Bộ phận thi tuyển & Ngày phỏng vấn</div>
<div class="form-row">
<div class="form-group"><label>Bộ phận thi tuyển <span class="required-star">*</span></label>
<select id="cf_bophan" required><option value="">-- Chọn --</option><option>Sản xuất P.3.03</option><option>Sản xuất 2.1</option><option>Sản xuất 2.2</option><option>Sản xuất 3</option><option>Sản xuất 4</option><option>Kiểm tra 1</option><option>Kiểm tra 2</option></select>
<div class="error-msg" id="err_cf_bophan">Bắt buộc</div></div>
<div class="form-group"><label>Ngày phỏng vấn</label><input type="date" id="cf_ivDate"></div>
<div class="form-group"><label>Số báo danh</label><input type="text" id="cf_sobaodanh" placeholder="VD: 01"></div>
</div>
<div class="section-title">1. (*) Phần điền bắt buộc</div>
<div class="form-row">
<div class="form-group" style="flex:2"><label>Họ và tên <span class="required-star">*</span> (IN HOA)</label><input type="text" id="cf_name" required class="uppercase-input"><div class="error-msg" id="err_cf_name">Phải IN HOA</div></div>
<div class="form-group"><label>Ngày sinh <span class="required-star">*</span></label><input type="date" id="cf_dob" required><div class="error-msg" id="err_cf_dob">Bắt buộc</div></div>
</div>
<div class="form-row">
<div class="form-group"><label>Giới tính <span class="required-star">*</span></label><select id="cf_gender" required><option value="">--</option><option>Nam</option><option>Nữ</option></select><div class="error-msg" id="err_cf_gender">Bắt buộc</div></div>
<div class="form-group"><label>Dân tộc</label><input type="text" id="cf_ethnic" placeholder="Kinh"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Tình trạng kết hôn <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="cf_marital" value="Kết hôn" required> Kết hôn</label>
<label><input type="radio" name="cf_marital" value="Độc thân"> Độc thân</label>
</div>
<div class="error-msg" id="err_cf_marital">Bắt buộc</div></div>
<div class="form-group"><label>Số con</label><input type="number" id="cf_children" min="0" value="0"></div>
<div class="form-group"><label>Con mấy tuổi</label><input type="text" id="cf_childAge" placeholder="VD: 3, 7"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Số CCCD <span class="required-star">*</span></label><input type="text" id="cf_cccd" required maxlength="12"><div class="error-msg" id="err_cf_cccd">12 số</div></div>
<div class="form-group"><label>Ngày cấp</label><input type="date" id="cf_cccdDate"></div>
<div class="form-group"><label>Nơi cấp</label><input type="text" id="cf_cccdPlace" placeholder="Cục CS QLHC..."></div>
</div>
<div class="form-group"><label>Hạn căn cước</label><input type="date" id="cf_cccdExpiry"></div>
<div class="form-row">
<div class="form-group"><label>Số điện thoại <span class="required-star">*</span></label><input type="text" id="cf_phone" required maxlength="10"><div class="error-msg" id="err_cf_phone">10 số, bắt đầu 0</div><div class="error-msg" id="err_cf_phone_dup">SĐT đã tồn tại!</div></div>
<div class="form-group"><label>Số điện thoại người thân</label><input type="text" id="cf_relativePhone" maxlength="11" placeholder="SĐT người thân"></div>
</div>
<div class="form-row">
<div class="form-group" style="flex:2"><label>Đ/c thường trú: Thôn/xóm/số nhà <span class="required-star">*</span></label><input type="text" id="cf_permAddr" required><div class="error-msg" id="err_cf_perm">Bắt buộc</div></div>
<div class="form-group"><label>Xã/phường</label><input type="text" id="cf_permWard"></div>
<div class="form-group"><label>Tỉnh/TP</label><input type="text" id="cf_permCity"></div>
</div>
<div class="form-row">
<div class="form-group" style="flex:2"><label>Đ/c tạm trú hiện nay: Thôn/xóm/số nhà</label><input type="text" id="cf_currAddr"><div class="error-msg" id="err_cf_curr"></div></div>
<div class="form-group"><label>Xã/phường</label><input type="text" id="cf_currWard"></div>
<div class="form-group"><label>Tỉnh/TP</label><input type="text" id="cf_currCity"></div>
</div>
<div class="form-row">
<div class="form-group"><label>Chiều cao (cm)</label><input type="number" id="cf_height" min="100" max="250" placeholder="162"></div>
<div class="form-group"><label>Cân nặng (kg)</label><input type="number" id="cf_weight" min="30" max="200" placeholder="62"></div>
<div class="form-group"><label>Cỡ giày</label><input type="text" id="cf_shoeSize" placeholder="38"></div>
</div>
<div class="form-group"><label>Gmail</label><input type="email" id="cf_email"><div class="error-msg" id="err_cf_email">Không hợp lệ</div><div class="error-msg" id="err_cf_email_dup">Email đã tồn tại!</div></div>
<div class="section-title">2. Kinh nghiệm làm việc (Khoanh tròn các mục)</div>
<div class="form-row">
<div class="form-group"><label>(*) Tốt nghiệp trường <span class="required-star">*</span></label>
<select id="cf_edu" required><option value="">--</option><option>Cấp 2</option><option>Cấp 3</option><option>Đại học</option><option>Cao đẳng</option><option>Trung cấp</option><option>Khác</option></select>
<div class="error-msg" id="err_cf_edu">Bắt buộc</div></div>
<div class="form-group"><label>Tên trường</label><input type="text" id="cf_school"><div class="error-msg" id="err_cf_school"></div></div>
<div class="form-group"><label>Năm tốt nghiệp</label><input type="text" id="cf_gradYear" placeholder="2017"><div class="error-msg" id="err_cf_gradYear"></div></div>
</div>
<div class="info-note">(*) Sau khi tốt nghiệp trường cuối cùng, làm gì ở đâu: (Lưu ý ghi chi tiết vào các cột dưới đây)</div>
<table class="exp-table" id="expTable">
<thead><tr><th style="width:18%">Thời gian (năm => năm)</th><th style="width:25%">Nội dung công việc (Ghi chi tiết)</th><th style="width:22%">Đơn vị công tác (Tên Cty/nhà hàng)</th><th style="width:15%">Địa điểm</th><th style="width:12%">Mức lương TB</th><th style="width:8%">Xóa</th></tr></thead>
<tbody id="expTBody">
<tr><td><input type="text" class="exp-time" placeholder="2015-2016"></td><td><input type="text" class="exp-job" placeholder="Nhân viên QA"></td><td><input type="text" class="exp-company" placeholder="Toyota Bosoku"></td><td><input type="text" class="exp-location" placeholder="Hải Phòng"></td><td><input type="text" class="exp-salary" placeholder="12tr"></td><td><button type="button" class="remove-row" onclick="removeExpRow(this)">✕</button></td></tr>
</tbody>
</table>
<button type="button" class="add-row-btn" id="btnAddExp">+ Thêm dòng kinh nghiệm</button>
<div class="form-group" style="margin-top:14px"><label>Chuyên ngành</label><input type="text" id="cf_major"><div class="error-msg" id="err_cf_major"></div></div>
<div class="section-title">3. (*) Xác nhận (Khoanh tròn các mục)</div>
<div class="form-group"><label>Bạn đã phỏng vấn ở công ty ShinEtsu lần nào chưa? <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="cf_prevIV" value="Chưa" required> Chưa</label>
<label><input type="radio" name="cf_prevIV" value="Đã PV"> Đã PV</label>
</div>
<div class="error-msg" id="err_cf_prevIV">Bắt buộc</div></div>
<div class="form-row" id="cf_prevIVDetail" style="display:none">
<div class="form-group"><label>Mấy lần</label><input type="text" id="cf_prevIVTimes" placeholder="1"></div>
<div class="form-group"><label>Khi nào</label><input type="text" id="cf_prevIVWhen" placeholder="Tháng 3/2024"></div>
</div>
<div class="form-group"><label>Thời gian bạn có thể đi làm <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="radio" name="cf_availTime" value="Đi làm ngay" required> Đi làm ngay</label>
<label><input type="radio" name="cf_availTime" value="Chọn ngày"> Đi làm từ ngày:</label>
</div>
<div class="error-msg" id="err_cf_availTime">Bắt buộc</div></div>
<div class="form-row" id="cf_availDateWrap" style="display:none">
<div class="form-group"><label>Đi làm từ ngày</label><input type="date" id="cf_availDate"></div>
<div class="form-group"><label>Lý do</label><input type="text" id="cf_availReason" placeholder="Lý do chưa đi được"></div>
</div>
<div class="form-group"><label>Bạn có hút thuốc lá/lào không?</label>
<div class="checkbox-group">
<label><input type="radio" name="cf_smoke" value="Có"> Có</label>
<label><input type="radio" name="cf_smoke" value="Không"> Không</label>
</div></div>
<div class="form-group"><label>Bạn có các bệnh tiền sử (ho/lao/hen suyễn) không?</label>
<div class="checkbox-group">
<label><input type="radio" name="cf_disease" value="Có"> Có</label>
<label><input type="radio" name="cf_disease" value="Không"> Không</label>
</div></div>
<div class="form-group"><label>Bạn biết đến thông tin tuyển dụng qua đâu? <span class="required-star">*</span></label>
<div class="checkbox-group">
<label><input type="checkbox" name="cf_src" value="Facebook"> Facebook</label>
<label><input type="checkbox" name="cf_src" value="Người quen"> Người quen</label>
<label><input type="checkbox" name="cf_src" value="Biển quảng cáo"> Biển quảng cáo</label>
<label><input type="checkbox" name="cf_src" value="Đơn vị tư vấn việc làm"> Đơn vị tư vấn việc làm</label>
<label><input type="checkbox" name="cf_src" value="Hội thảo/Loa đài"> Hội thảo/Loa đài</label>
<label><input type="checkbox" name="cf_src" value="Website"> Website</label>
<label><input type="checkbox" name="cf_src" value="Khác"> Khác</label>
</div>
<div class="error-msg" id="err_cf_src">Chọn ít nhất 1</div></div>
<div class="form-group"><label>Kênh cụ thể</label><input type="text" id="cf_channel" placeholder="Qua Website công ty..."></div>
<div class="form-group"><label>Bạn có đăng ký đi xe bus công ty không?</label>
<div class="checkbox-group">
<label><input type="radio" name="cf_bus" value="Không"> Không</label>
<label><input type="radio" name="cf_bus" value="Có"> Có</label>
</div></div>
<div class="form-row" id="cf_busDetailWrap" style="display:none">
<div class="form-group"><label>Điểm đón</label><input type="text" id="cf_busStop" placeholder="Cổng TTGD.CT Hồng Bàng"></div>
</div>
<div class="section-title">Ngoại ngữ (tùy chọn)</div>
<div class="form-row">
<div class="form-group"><label>Tiếng Trung</label><select id="cf_chinese"><option value="Không">Không</option><option value="Có">Có</option></select></div>
<div class="form-group"><label>Tiếng Anh</label><select id="cf_english"><option value="Không">Không</option><option value="Có">Có</option></select></div>
<div class="form-group"><label>Kinh nghiệm (năm)</label><input type="number" id="cf_expYears" min="0" value="0"></div>
</div>
<div class="section-title">CV Ứng Tuyển (tùy chọn)</div>
<div class="info-note">📎 Chỉ chấp nhận file PDF. Tối đa 10MB. Không bắt buộc.</div>
<div class="form-group">
<label>Tải lên CV (PDF)</label>
<div class="cv-upload-area" id="cvUploadArea">
<div class="cv-icon">📄</div>
<p><strong>Kéo thả file PDF vào đây</strong></p>
<p>hoặc <span style="color:#3498db;font-weight:700;text-decoration:underline">nhấn để chọn file</span></p>
<p class="cv-hint">Chấp nhận: .pdf — Tối đa: 10MB</p>
<input type="file" id="cf_cvFile" accept=".pdf,application/pdf" style="display:none">
</div>
<div id="cvPreviewWrap" style="display:none">
<div class="cv-preview" id="cvPreview">
<span>📄</span>
<a id="cvLink" href="#" target="_blank">file.pdf</a>
<span class="cv-size" id="cvSize"></span>
<button type="button" class="cv-remove" id="cvRemove">✕ Xóa</button>
</div>
</div>
<div class="error-msg" id="err_cf_cv">Chỉ chấp nhận file PDF, tối đa 10MB!</div>
</div>
<div class="section-title">Vị trí ứng tuyển mong muốn</div>
<div class="info-note">Nhập tối đa 3 vị trí mong muốn.</div>
<div class="form-group"><label>Vị trí 1 <span class="required-star">*</span></label><input type="text" id="cf_wish1" required placeholder="VD: Nhân viên QC"><div class="error-msg" id="err_cf_wish1">Bắt buộc</div></div>
<div class="form-group"><label>Vị trí 2</label><input type="text" id="cf_wish2" placeholder="Tùy chọn"></div>
<div class="form-group"><label>Vị trí 3</label><input type="text" id="cf_wish3" placeholder="Tùy chọn"></div>
<div class="commitment-box"><label><input type="checkbox" id="cf_commit"> Tôi không phải nộp bất kỳ một khoản chi phí nào cho nhân viên tư vấn tuyển dụng hoặc các công ty cung ứng khác để có việc làm tại công ty ShinEtsu. Tôi xin xác nhận những thông tin ở trên là đúng sự thật.</label><div class="error-msg" id="err_cf_commit">Phải đánh dấu</div></div>
<div style="text-align:center;margin-top:24px"><button type="submit" class="btn btn-primary" style="min-width:260px;min-height:50px" id="cfBtn">💾 Lưu</button></div>
</form>
</div></div>
</div>
<!-- CANDIDATE DETAIL -->
<div id="candDetailView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>Chi Tiết Ứng Viên</h2><div><button class="btn btn-back" id="btnBackCD">←</button><button class="btn btn-edit" id="btnEditC">🖊</button><button class="btn btn-pdf" id="btnPDFCD">📄 In Phiếu ShinEtsu</button></div></div>
<div id="cdContent"></div>
<div style="text-align:center;margin-top:18px"><button class="btn btn-info" id="btnSchedDetail">📅 Đặt lịch PV</button></div>
</div></div>
</div>
<!-- INTERVIEW LIST -->
<div id="ivListView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>Lịch Phỏng Vấn</h2><div><button class="btn btn-back" id="btnBackIVL">←</button><button class="btn btn-pdf" id="btnPDFIVL">📄</button><button class="btn btn-excel" id="btnExcelIVL">📊 Excel</button></div></div>
<div class="search-filter-bar"><h3>🔍 Tìm</h3><div class="filter-row">
<div class="filter-group"><label>Từ</label><input type="date" id="fI_from"></div>
<div class="filter-group"><label>Đến</label><input type="date" id="fI_to"></div>
<div class="filter-group"><label>Tên</label><input type="text" id="fI_name"></div>
<button class="filter-btn filter-btn-search" id="btnFI">🔍</button><button class="filter-btn filter-btn-reset" id="btnRI">↻</button>
</div><div class="search-result-info" id="iInfo"></div></div>
<div class="table-wrapper"><table><thead><tr><th>Mã PV</th><th>Họ tên</th><th>Vị trí</th><th>Người PV</th><th>Thời gian</th><th>Địa điểm</th><th>Test</th><th>KQ</th><th>Người TT</th><th>Thời gian TT</th><th>Thao tác</th></tr></thead><tbody id="iTB"></tbody></table></div>
</div></div>
</div>
<!-- SCHEDULE FORM -->
<div id="schedFormView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2 id="sfTitle">Đặt Lịch PV</h2><button class="btn btn-back" id="btnBackSF">←</button></div>
<div id="sfBanner" class="edit-mode-banner" style="display:none">🖊 Sửa: <span id="sfCode"></span></div>
<form id="schedForm">
<input type="hidden" id="si_ci" value="-1"><input type="hidden" id="si_ei" value="-1">
<div id="sfInfo"></div>
<div class="section-title">Người phỏng vấn</div>
<div class="info-note">⚠ Chỉ cho phép từ Trưởng nhóm trở lên.</div>
<div class="form-row">
<div class="form-group"><label>Mã NV <span class="required-star">*</span></label><input type="text" id="si_id" required><div class="error-msg" id="err_si_level">Chỉ từ Trưởng nhóm trở lên</div></div>
<div class="form-group"><label>Họ tên (IN HOA) <span class="required-star">*</span></label><input type="text" id="si_name" required class="uppercase-input"><div class="error-msg" id="err_si_name">Phải IN HOA</div></div>
</div>
<div class="form-row">
<div class="form-group"><label>Chức vụ <span class="required-star">*</span></label><select id="si_title" required><option value="">--</option><option>Trưởng nhóm</option><option>Quản lý</option><option>Giám đốc</option></select></div>
<div class="form-group"><label>Bộ phận</label><input type="text" id="si_dept2" readonly></div>
</div>
<div class="section-title">Vị trí phỏng vấn</div>
<div class="form-group"><label>Nhập vị trí <span class="required-star">*</span></label><input type="text" id="si_ivPosition" required placeholder="VD: Nhân viên QC"></div>
<div class="section-title">Thời gian & Địa điểm</div>
<div class="form-row">
<div class="form-group"><label>Thời gian <span class="required-star">*</span></label><input type="datetime-local" id="si_time" required><div class="error-msg" id="err_si_dup_time">Trùng!</div></div>
<div class="form-group"><label>Địa điểm <span class="required-star">*</span></label><select id="si_location" required><option value="">--</option><option>Nhà máy 1</option><option>Nhà máy 2</option><option>Nhà máy 3</option><option>Nhà máy 4</option></select></div>
</div>
<div class="form-group"><label>Bài kiểm tra <span class="required-star">*</span></label>
<div class="checkbox-group"><label><input type="checkbox" name="si_test" value="Tiếng Anh"> Tiếng Anh</label><label><input type="checkbox" name="si_test" value="IQ"> IQ</label><label><input type="checkbox" name="si_test" value="Nhân cách"> Nhân cách</label></div>
<div class="error-msg" id="err_si_test">Chọn ít nhất 1</div></div>
<div style="text-align:center;margin-top:20px"><button type="submit" class="btn btn-primary" style="min-width:220px" id="sfBtn">✅ Xác nhận</button></div>
</form>
</div></div>
</div>
<!-- RESULT VIEW -->
<div id="resView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>Kết Quả PV</h2><div><button class="btn btn-back" id="btnBackRes">←</button><button class="btn btn-pdf" id="btnPDFRes">📄</button><button class="btn btn-excel" id="btnExcelRes">📊 Excel</button></div></div>
<div class="search-filter-bar"><h3>🔍 Tìm</h3><div class="filter-row">
<div class="filter-group"><label>Từ</label><input type="date" id="fRes_from"></div>
<div class="filter-group"><label>Đến</label><input type="date" id="fRes_to"></div>
<div class="filter-group"><label>Tên</label><input type="text" id="fRes_name"></div>
<button class="filter-btn filter-btn-search" id="btnFRes">🔍</button><button class="filter-btn filter-btn-reset" id="btnRRes">↻</button>
</div></div>
<div class="table-wrapper"><table><thead><tr><th>Mã PV</th><th>Họ tên</th><th>Vị trí</th><th>Thời gian</th><th>KQ</th><th>Đánh giá</th><th>Người TT</th><th>Thời gian TT</th><th>Thao tác</th></tr></thead><tbody id="resTB"></tbody></table></div>
</div></div>
</div>
<!-- ONBOARDING VIEW -->
<div id="obView" class="view">
<div class="container"><div class="card">
<div class="actions-bar"><h2>Nhân Viên Mới</h2><div><button class="btn btn-back" id="btnBackOB">←</button><button class="btn btn-pdf" id="btnPDFOB">📄</button><button class="btn btn-excel" id="btnExcelOB">📊 Excel</button></div></div>
<div class="search-filter-bar"><h3>🔍 Tìm</h3><div class="filter-row">
<div class="filter-group"><label>Từ</label><input type="date" id="fO_from"></div>
<div class="filter-group"><label>Đến</label><input type="date" id="fO_to"></div>
<div class="filter-group"><label>Tên</label><input type="text" id="fO_name"></div>
<div class="filter-group"><label>SĐT</label><input type="text" id="fO_phone"></div>
<button class="filter-btn filter-btn-search" id="btnFO">🔍</button><button class="filter-btn filter-btn-reset" id="btnRO">↻</button>
</div><div class="search-result-info" id="oInfo"></div></div>
<div class="table-wrapper"><table><thead><tr><th>Mã UV</th><th>Họ tên</th><th>Vị trí</th><th>Phòng ban</th><th>Ngày BĐ</th><th>Lương TV</th><th>TT</th><th>Người TT</th><th>Thời gian TT</th><th>Thao tác</th></tr></thead><tbody id="oTB"></tbody></table></div>
</div></div>
</div>
<script>
var RC=1,IC=1,D={r:[],c:[],iv:[],ivr:[],ia:[],ob:[],notify:[],logs:[]};
var curV='mainView',hist=[],curCI=-1,curRC='',op={id:'',name:'',dept:'',title:''},clockI=null;
var cvStore={};
var lastFilteredR=null,lastFilteredC=null,lastFilteredIV=null,lastFilteredRes=null,lastFilteredOB=null;
function show(id){if(curV!==id)hist.push(curV);document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active');v.style.display='none'});var t=document.getElementById(id);if(t){t.classList.add('active');t.style.display='block'}curV=id;window.scrollTo(0,0)}
function back(t){if(t){hist=hist.filter(function(v){return v!==t});show(t)}else if(hist.length)show(hist.pop());else show('mainView')}
function gc(){return'P'+String(RC++).padStart(5,'0')}
function gic(){return'V'+String(IC++).padStart(5,'0')}
function gcc(i){return'UV'+String(i).padStart(5,'0')}
function fd(d){var x=new Date(d);if(isNaN(x))return'';return String(x.getDate()).padStart(2,'0')+'/'+String(x.getMonth()+1).padStart(2,'0')+'/'+x.getFullYear()}
function fdt(d){if(!d)return'';var x=new Date(d);if(isNaN(x))return'';return fd(d)+' '+String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')}
function ffdt(){var x=new Date();return fd(x.toISOString())+' '+String(x.getHours()).padStart(2,'0')+':'+String(x.getMinutes()).padStart(2,'0')+':'+String(x.getSeconds()).padStart(2,'0')}
function gn(){return new Date().toISOString()}
function ga(r){if(r.ap1s==='Đã duyệt'&&r.ap2s==='Đã duyệt'&&r.ap3s==='Đã duyệt')return'Đã duyệt';if(r.ap1s==='Từ chối'||r.ap2s==='Từ chối'||r.ap3s==='Từ chối')return'Từ chối';return'Chờ duyệt'}
function fiv(c){return D.iv.find(function(x){return x.code===c})}
function fivr(c){return D.ivr.find(function(x){return x.ic===c})}
function fia(c){return D.ia.find(function(x){return x.ic===c})}
function fnot(c){return D.notify.find(function(x){return x.ic===c})}
function fob(c){return D.ob.find(function(x){return x.cc===c})}
function fcand(c){return D.c.find(function(x){return x.code===c})}
function log(a,t){D.logs.push({time:ffdt(),opId:op.id,opName:op.name,action:a,target:t||''})}
function ms(v,q){if(!q)return true;return(v||'').toLowerCase().indexOf(q.toLowerCase())>=0}
function ir(ds,f,t){if(!f&&!t)return true;var d=new Date(ds);if(isNaN(d))return true;if(f){var fr=new Date(f);fr.setHours(0,0,0,0);if(d<fr)return false}if(t){var to=new Date(t);to.setHours(23,59,59,999);if(d>to)return false}return true}
function resetF(id){var f=document.getElementById(id);if(f){f.reset();f.querySelectorAll('.error-msg').forEach(function(e){e.style.display='none'})}}
function startClock(){function u(){var n=new Date();document.getElementById('liveClock').textContent=String(n.getDate()).padStart(2,'0')+'/'+String(n.getMonth()+1).padStart(2,'0')+'/'+n.getFullYear()+' '+String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0')}u();if(clockI)clearInterval(clockI);clockI=setInterval(u,1000)}
function isUpper(s){if(!s)return false;return s===s.toUpperCase()&&/^[A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\\s]+$/i.test(s)&&s===s.toUpperCase()}
function checkDupRecr(p,d,ei){var pos=p.trim().toLowerCase(),dp=d.trim().toLowerCase();return D.r.some(function(r,i){if(ei>=0&&i===ei)return false;return r.position.trim().toLowerCase()===pos&&r.dept.trim().toLowerCase()===dp})}
function checkDupCandPhone(ph,ei){return D.c.some(function(c,i){return c.phone===ph&&i!==ei})}
function checkDupCandEmail(em,ei){if(!em)return false;return D.c.some(function(c,i){return c.email&&c.email.toLowerCase()===em.toLowerCase()&&i!==ei})}
function checkDupIVTime(time,ei){if(!time)return false;var t=new Date(time).getTime();return D.iv.some(function(iv,i){if(ei>=0&&i===ei)return false;return Math.abs(new Date(iv.time).getTime()-t)<60000})}
function fmtSize(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';return(b/1048576).toFixed(1)+' MB'}
function exportExcel(headers,rows,filename){var ws=XLSX.utils.aoa_to_sheet([headers].concat(rows));var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Sheet1');XLSX.writeFile(wb,(filename||'export')+'.xlsx')}
function addExpRow(){var tb=document.getElementById('expTBody');var tr=document.createElement('tr');tr.innerHTML='<td><input type="text" class="exp-time" placeholder="2020-2023"></td><td><input type="text" class="exp-job" placeholder="Nội dung công việc"></td><td><input type="text" class="exp-company" placeholder="Tên công ty"></td><td><input type="text" class="exp-location" placeholder="Địa điểm"></td><td><input type="text" class="exp-salary" placeholder="Lương TB"></td><td><button type="button" class="remove-row" onclick="removeExpRow(this)">✕</button></td>';tb.appendChild(tr)}
function removeExpRow(btn){var tr=btn.closest('tr');var tb=document.getElementById('expTBody');if(tb.rows.length>1)tr.remove();else alert('Phải có ít nhất 1 dòng')}
function getExpData(){var rows=document.querySelectorAll('#expTBody tr'),data=[];rows.forEach(function(tr){var time=tr.querySelector('.exp-time').value.trim(),job=tr.querySelector('.exp-job').value.trim(),company=tr.querySelector('.exp-company').value.trim(),location=tr.querySelector('.exp-location').value.trim(),salary=tr.querySelector('.exp-salary').value.trim();if(time||job||company)data.push({time:time,job:job,company:company,location:location,salary:salary})});return data}
function setExpData(data){var tb=document.getElementById('expTBody');tb.innerHTML='';if(!data||!data.length){addExpRow();return}data.forEach(function(d){var tr=document.createElement('tr');tr.innerHTML='<td><input type="text" class="exp-time" value="'+(d.time||'')+'"></td><td><input type="text" class="exp-job" value="'+(d.job||'')+'"></td><td><input type="text" class="exp-company" value="'+(d.company||'')+'"></td><td><input type="text" class="exp-location" value="'+(d.location||'')+'"></td><td><input type="text" class="exp-salary" value="'+(d.salary||'')+'"></td><td><button type="button" class="remove-row" onclick="removeExpRow(this)">✕</button></td>';tb.appendChild(tr)})}
document.getElementById('btnAddExp').addEventListener('click',addExpRow);
var pendingCV=null;
function initCVUpload(){var area=document.getElementById('cvUploadArea');var inp=document.getElementById('cf_cvFile');area.addEventListener('click',function(){inp.click()});area.addEventListener('dragover',function(e){e.preventDefault();area.style.borderColor='#27ae60';area.style.background='#f0fff4'});area.addEventListener('dragleave',function(){area.style.borderColor='#3498db';area.style.background='#f8f9ff'});area.addEventListener('drop',function(e){e.preventDefault();area.style.borderColor='#3498db';area.style.background='#f8f9ff';if(e.dataTransfer.files.length)handleCVFile(e.dataTransfer.files[0])});inp.addEventListener('change',function(){if(inp.files.length)handleCVFile(inp.files[0]);inp.value=''});document.getElementById('cvRemove').addEventListener('click',function(){clearCV()})}
function handleCVFile(file){var errEl=document.getElementById('err_cf_cv');errEl.style.display='none';if(file.type!=='application/pdf'){errEl.textContent='Chỉ chấp nhận file PDF!';errEl.style.display='block';return}if(file.size>10*1024*1024){errEl.textContent='File quá lớn! Tối đa 10MB.';errEl.style.display='block';return}var reader=new FileReader();reader.onload=function(e){pendingCV={name:file.name,size:file.size,dataUrl:e.target.result};showCVPreview(pendingCV)};reader.readAsDataURL(file)}
function showCVPreview(cv){document.getElementById('cvLink').textContent=cv.name;document.getElementById('cvLink').href=cv.dataUrl;document.getElementById('cvLink').setAttribute('download',cv.name);document.getElementById('cvSize').textContent='('+fmtSize(cv.size)+')';document.getElementById('cvPreviewWrap').style.display='block';document.getElementById('cvUploadArea').style.display='none'}
function clearCV(){pendingCV=null;document.getElementById('cvPreviewWrap').style.display='none';document.getElementById('cvUploadArea').style.display='block';document.getElementById('err_cf_cv').style.display='none'}
function loadCVForEdit(idx){clearCV();if(cvStore[idx]){pendingCV={name:cvStore[idx].name,size:cvStore[idx].size,dataUrl:cvStore[idx].dataUrl};showCVPreview(pendingCV)}}
function genPH(title,body){return'<div class="print-area"><div style="text-align:center;margin-bottom:20px"><h3>CÔNG TY TNHH ABC</h3><p style="font-size:.85em;color:#666">123 Đường XYZ, Q1, TP.HCM</p><hr style="border:1px solid #333;margin:10px 0"><h2 style="text-align:center;border:none;margin-top:10px">'+title+'</h2></div>'+body+'<div class="print-footer"><div><p><strong>Người lập</strong></p><p>'+op.name+'</p></div><div><p><strong>Ngày</strong></p><p>'+ffdt()+'</p></div><div><p><strong>Duyệt</strong></p><p style="margin-top:40px">(Ký)</p></div></div></div>'}
function showPDF(t,b){document.getElementById('pdfContent').innerHTML=b;document.getElementById('pdfModal').setAttribute('data-title',t);document.getElementById('pdfModal').classList.add('active')}
function dlPDF(){var el=document.getElementById('pdfContent'),t=document.getElementById('pdfModal').getAttribute('data-title')||'Doc';html2pdf().set({margin:5,filename:t.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf',image:{type:'jpeg',quality:.98},html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}).from(el).save()}
function printD(){var c=document.getElementById('pdfContent').innerHTML,w=window.open('','_blank','width=800,height=600');w.document.write('<html><head><title>In</title><style>body{font-family:"Times New Roman",serif;padding:10px;line-height:1.4;font-size:12px}table{width:100%;border-collapse:collapse;margin:4px 0}th{background:#e0e0e0;border:1px solid #000;padding:5px}td{border:1px solid #000;padding:5px}h2{text-align:center}.print-footer{margin-top:20px;display:flex;justify-content:space-between}.print-footer div{text-align:center;min-width:180px}.se-form{font-family:"Times New Roman",serif;color:#000;line-height:1.4;font-size:12px}.se-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}.se-logo{font-weight:900;font-size:18px;font-family:Arial,sans-serif}.se-title{text-align:center;font-size:15px;font-weight:700;flex:1}.se-date-box{border:1px solid #000;padding:4px 8px;font-size:11px}.se-section{font-weight:700;margin:8px 0 3px;font-size:12px}.se-field{margin:2px 0;font-size:11px}.se-field .se-label{font-weight:600}.se-field .se-val{border-bottom:1px dotted #000;display:inline-block;min-width:100px;padding:0 3px}.se-check{display:inline-block;width:13px;height:13px;border:1px solid #000;text-align:center;font-size:9px;line-height:13px;margin-right:3px;vertical-align:middle}.se-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px 10px}.se-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 10px}.se-footer{margin-top:12px;display:flex;justify-content:space-between;font-size:11px}.se-footer div{text-align:center;min-width:160px}table.se-table{width:100%;border-collapse:collapse}table.se-table td,table.se-table th{border:1px solid #000;padding:4px 6px;font-size:11px}</style></head><body>'+c+'</body></html>');w.document.close();setTimeout(function(){w.print()},500)}
function tH(h,r){var s='<table><thead><tr>';h.forEach(function(x){s+='<th>'+x+'</th>'});s+='</tr></thead><tbody>';r.forEach(function(row){s+='<tr>';row.forEach(function(c){s+='<td>'+(c||'')+'</td>'});s+='</tr>'});return s+'</tbody></table>'}
function genShinEtsuPDF(c,idx){var ck=function(v,match){return v===match?'✓':' '};var expHTML='';if(c.experiences&&c.experiences.length){c.experiences.forEach(function(e){expHTML+='<tr><td>'+e.time+'</td><td>'+e.job+'</td><td>'+e.company+'</td><td>'+e.location+'</td><td>'+e.salary+'</td></tr>'});}else{for(var i=0;i<4;i++)expHTML+='<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>'}var srcChecks='';var srcList=['Facebook','Người quen','Biển quảng cáo','Đơn vị tư vấn việc làm','Hội thảo/Loa đài','Website','Khác'];srcList.forEach(function(s){var checked=c.sources&&c.sources.indexOf(s)>=0;srcChecks+='<span class="se-check">'+(checked?'✓':' ')+'</span> '+s+'&nbsp;&nbsp;&nbsp;'});var maritalVal=c.marital||'';var fullPermAddr=(c.permAddr||'')+(c.permWard?', '+c.permWard:'')+(c.permCity?', '+c.permCity:'');var fullCurrAddr=(c.currAddr||'')+(c.currWard?', '+c.currWard:'')+(c.currCity?', '+c.currCity:'');var html='<div class="se-form">';html+='<div class="se-header"><div class="se-logo">Shin<span style="color:#c00">Etsu</span></div><div class="se-title">THÔNG TIN TRƯỚC PHỎNG VẤN</div><div class="se-date-box">Ngày phỏng vấn: <strong>'+(c.ivDate?fd(c.ivDate):'...../...../........')+'</strong><br>Số báo danh: <strong>'+(c.sobaodanh||'........')+'</strong></div></div>';html+='<div class="se-section">1. (*) Phần điền bắt buộc</div><div style="margin-left:10px">';html+='<div class="se-grid"><div class="se-field">Bộ phận thi tuyển: <span class="se-val">'+(c.bophan||'')+'</span></div></div>';html+='<div class="se-grid"><div class="se-field">Họ và tên: <span class="se-val"><strong>'+c.name+'</strong></span></div><div class="se-field">Ngày sinh: <span class="se-val">'+fd(c.dob)+'</span> &nbsp;Giới tính: <span class="se-val">'+c.gender+'</span> &nbsp;Dân tộc: <span class="se-val">'+(c.ethnic||'Kinh')+'</span></div></div>';html+='<div class="se-field">Tình trạng kết hôn: &nbsp;<span class="se-check">'+ck(maritalVal,'Kết hôn')+'</span> Kết hôn &nbsp;&nbsp;<span class="se-check">'+ck(maritalVal,'Độc thân')+'</span> Độc thân &nbsp;&nbsp; Số con: <span class="se-val">'+(c.children||'0')+'</span> &nbsp;Con mấy tuổi: <span class="se-val">'+(c.childAge||'')+'</span></div>';html+='<div class="se-field">Số CCCD: <span class="se-val">'+c.cccd+'</span> &nbsp;Ngày cấp: <span class="se-val">'+(c.cccdDate?fd(c.cccdDate):'')+'</span> &nbsp;Nơi cấp: <span class="se-val">'+(c.cccdPlace||'')+'</span> &nbsp;Hạn căn cước: <span class="se-val">'+(c.cccdExpiry?fd(c.cccdExpiry):'')+'</span></div>';html+='<div class="se-grid"><div class="se-field">Số điện thoại: <span class="se-val">'+c.phone+'</span></div><div class="se-field">Số điện thoại người thân: <span class="se-val">'+(c.relativePhone||'')+'</span></div></div>';html+='<div class="se-field">Đ/c thường trú: <span class="se-val">'+fullPermAddr+'</span></div>';html+='<div class="se-field">Đ/c tạm trú hiện nay: <span class="se-val">'+fullCurrAddr+'</span></div>';html+='<div class="se-grid3"><div class="se-field">Chiều cao: <span class="se-val">'+(c.height||'')+'</span> cm</div><div class="se-field">Cân nặng: <span class="se-val">'+(c.weight||'')+'</span> kg</div><div class="se-field">Cỡ giày: <span class="se-val">'+(c.shoeSize||'')+'</span></div></div></div>';html+='<div class="se-section">2. Kinh nghiệm làm việc</div><div style="margin-left:10px">';var eduList=['Cấp 2','Cấp 3','Đại học','Cao đẳng','Trung cấp','Khác'];html+='<div class="se-field">(*) Tốt nghiệp trường: &nbsp;';eduList.forEach(function(e){html+='<span class="se-check">'+ck(c.edu,e)+'</span> '+e+'&nbsp;&nbsp;'});html+=' &nbsp;Tên trường: <span class="se-val">'+(c.school||'')+'</span> &nbsp;Năm tốt nghiệp: <span class="se-val">'+(c.gradYear||'')+'</span></div>';html+='<table class="se-table"><thead><tr><th>Thời gian</th><th>Nội dung</th><th>Đơn vị</th><th>Địa điểm</th><th>Mức lương TB</th></tr></thead><tbody>'+expHTML+'</tbody></table></div>';html+='<div class="se-section">(*) 3. Xác nhận</div><div style="margin-left:10px">';var prevIV=c.prevIV||'Chưa';html+='<div class="se-field">• Đã PV ShinEtsu? &nbsp;<span class="se-check">'+ck(prevIV,'Chưa')+'</span> Chưa &nbsp;<span class="se-check">'+ck(prevIV,'Đã PV')+'</span> Đã PV</div>';var availTime=c.availTime||'';html+='<div class="se-field">• Thời gian đi làm: &nbsp;<span class="se-check">'+ck(availTime,'Đi làm ngay')+'</span> Đi làm ngay &nbsp;<span class="se-check">'+ck(availTime,'Chọn ngày')+'</span> Đi làm từ ngày: <span class="se-val">'+(c.availDate?fd(c.availDate):'')+'</span></div>';var smoke=c.smoke||'';html+='<div class="se-field">• Hút thuốc? &nbsp;<span class="se-check">'+ck(smoke,'Có')+'</span> Có &nbsp;<span class="se-check">'+ck(smoke,'Không')+'</span> Không</div>';html+='<div class="se-field">• Nguồn TD: &nbsp;'+srcChecks+'</div>';var bus=c.bus||'Không';html+='<div class="se-field">• Xe bus? &nbsp;<span class="se-check">'+ck(bus,'Không')+'</span> Không &nbsp;<span class="se-check">'+ck(bus,'Có')+'</span> Có</div></div>';html+='<div class="se-footer"><div><strong>Người tuyển dụng</strong><br><br>Kết quả: □ OK &nbsp;□ NG</div><div><strong>Ký và ghi rõ họ tên</strong><br><br><br>'+c.name+'</div></div></div>';return html}
var techFields=['ia_knowledge','ia_experience','ia_problem','ia_logic','ia_tools'];var softFields=['ia_communication','ia_teamwork','ia_attitude','ia_learning','ia_culture'];
function calcEvalScores(){var tech=0,tc=0;techFields.forEach(function(f){var v=parseInt(document.getElementById(f).value);if(v){tech+=v;tc++}});var soft=0,sc=0;softFields.forEach(function(f){var v=parseInt(document.getElementById(f).value);if(v){soft+=v;sc++}});document.getElementById('iaTechScore').textContent=tc?tech+' / 25':'- / 25';document.getElementById('iaSoftScore').textContent=sc?soft+' / 25':'- / 25';var total=tech+soft;document.getElementById('iaTotalScore').textContent=(tc+sc)?total+' / 50':'- / 50';return(tc===5&&sc===5)?total:null}
techFields.concat(softFields).forEach(function(id){document.getElementById(id).addEventListener('change',calcEvalScores)});
function rnR(f){var tb=document.getElementById('rTB');tb.innerHTML='';var fl=D.r.filter(function(r){if(!f)return true;if(!ir(r.iso,f.from,f.to))return false;if(f.code&&!ms(r.code,f.code))return false;return true});lastFilteredR=fl;fl.forEach(function(r){var s=ga(r),oi=D.r.indexOf(r);var tr=document.createElement('tr');tr.innerHTML='<td><span class="code-link" data-rc="'+r.code+'">'+r.code+'</span></td><td>'+r.dept+'</td><td>'+r.position+'</td><td>'+r.qty+'</td><td>'+r.proposer+'</td><td>'+(r.location||'')+'</td><td>'+r.dateStr+'</td><td><span class="badge '+(s==='Đã duyệt'?'badge-approved':s==='Từ chối'?'badge-fail':'badge-pending')+'">'+s+'</span></td><td class="op-stamp">'+(r.opId||'')+' - '+(r.opName||'')+'</td><td class="op-stamp">'+fdt(r.iso)+'</td><td><button class="btn btn-edit" data-ri="'+oi+'" style="font-size:.78em;padding:5px 8px">🖊</button></td>';tb.appendChild(tr)});tb.querySelectorAll('.code-link').forEach(function(l){l.addEventListener('click',function(){curRC=this.getAttribute('data-rc');rnRD(curRC);show('recrDetailView')})});tb.querySelectorAll('button[data-ri]').forEach(function(b){b.addEventListener('click',function(){openEditR(parseInt(this.getAttribute('data-ri')))})});document.getElementById('rInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.r.length}
function rnRD(code){var r=D.r.find(function(x){return x.code===code});if(!r)return;curRC=code;var h='<div class="detail-grid">';[['Mã','<strong>'+r.code+'</strong>'],['Phòng ban',r.dept],['Vị trí',r.position],['Cấp bậc',r.level],['SL',r.qty],['Loại hình',r.types.join(', ')],['Lý do',r.reasons.join(', ')],['Địa điểm',r.location||''],['Thời gian LV',r.workTime||''],['Onboard',fd(r.startDate)],['Mức lương',r.salary||''],['Trạng thái','<span class="badge '+(ga(r)==='Đã duyệt'?'badge-approved':'badge-pending')+'">'+ga(r)+'</span>'],['Người thao tác',r.opId+' - '+r.opName],['Thời gian thao tác',fdt(r.iso)]].forEach(function(f){h+='<div class="label">'+f[0]+':</div><div class="value">'+f[1]+'</div>'});h+='</div>';document.getElementById('rdContent').innerHTML=h}
function rnC(f){var tb=document.getElementById('cTB');tb.innerHTML='';var fl=[];D.c.forEach(function(c,i){if(f){if(!ms(c.name,f.name))return;if(!ms(c.phone,f.phone))return;if(f.cccd&&!ms(c.cccd,f.cccd))return;if(!ir(c.iso,f.from,f.to))return}fl.push({c:c,i:i})});lastFilteredC=fl;fl.forEach(function(item){var c=item.c,idx=item.i;var w1=c.wishes?c.wishes[0]:'',w2=c.wishes?c.wishes[1]:'',w3=c.wishes?c.wishes[2]:'';var cvCell='';if(cvStore[idx]){cvCell='<a href="'+cvStore[idx].dataUrl+'" target="_blank" download="'+cvStore[idx].name+'" style="color:#3498db;font-weight:600;text-decoration:underline">📄 '+cvStore[idx].name.substring(0,15)+(cvStore[idx].name.length>15?'...':'')+'</a>'}else{cvCell='<span style="color:#aaa;font-size:.82em">Chưa có</span>'}var tr=document.createElement('tr');tr.innerHTML='<td><span class="code-link" data-ci="'+idx+'">'+c.code+'</span></td><td style="font-weight:600">'+c.name+'</td><td>'+c.phone+'</td><td>'+(c.email||'')+'</td><td>'+cvCell+'</td><td style="font-size:.82em">'+w1+'</td><td style="font-size:.82em">'+w2+'</td><td style="font-size:.82em">'+w3+'</td><td class="op-stamp">'+(c.opId||'')+' - '+(c.opName||'')+'</td><td class="op-stamp">'+fdt(c.iso)+'</td><td><button class="btn btn-info" data-si="'+idx+'" style="font-size:.78em;padding:5px 8px">📅</button> <button class="btn btn-edit" data-ei="'+idx+'" style="font-size:.78em;padding:5px 8px">🖊</button></td>';tb.appendChild(tr)});tb.querySelectorAll('.code-link[data-ci]').forEach(function(l){l.addEventListener('click',function(){rnCD(parseInt(this.getAttribute('data-ci')));show('candDetailView')})});tb.querySelectorAll('button[data-si]').forEach(function(b){b.addEventListener('click',function(){openSched(parseInt(this.getAttribute('data-si')))})});tb.querySelectorAll('button[data-ei]').forEach(function(b){b.addEventListener('click',function(){openEditC(parseInt(this.getAttribute('data-ei')))})});document.getElementById('cInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.c.length}
function rnCD(idx){curCI=idx;var c=D.c[idx];if(!c)return;var h='<div class="section-title">Thông tin ứng viên</div><div class="detail-grid">';var w1=c.wishes?c.wishes[0]:'',w2=c.wishes?c.wishes[1]:'',w3=c.wishes?c.wishes[2]:'';var cvDisplay='Chưa có';if(cvStore[idx]){cvDisplay='<a href="'+cvStore[idx].dataUrl+'" target="_blank" download="'+cvStore[idx].name+'" style="color:#3498db;font-weight:700;text-decoration:underline">📄 '+cvStore[idx].name+'</a> <span style="color:#888;font-size:.85em">('+fmtSize(cvStore[idx].size)+')</span>'}var fullPerm=(c.permAddr||'')+(c.permWard?', '+c.permWard:'')+(c.permCity?', '+c.permCity:'');var fullCurr=(c.currAddr||'')+(c.currWard?', '+c.currWard:'')+(c.currCity?', '+c.currCity:'');var expText='';if(c.experiences&&c.experiences.length){c.experiences.forEach(function(e){expText+=(expText?'; ':'')+e.time+' - '+e.job+' tại '+e.company})}var fields=[['Mã','<strong>'+c.code+'</strong>'],['Họ tên','<strong>'+c.name+'</strong>'],['Giới tính',c.gender],['Ngày sinh',fd(c.dob)],['CCCD',c.cccd],['SĐT',c.phone],['Gmail',c.email||''],['Trình độ',c.edu],['Trường',c.school||''],['CV',cvDisplay],['Vị trí 1',w1],['Vị trí 2',w2],['Vị trí 3',w3],['Người thao tác',(c.opId||'')+' - '+(c.opName||'')],['Thời gian thao tác',fdt(c.iso)]];fields.forEach(function(f){h+='<div class="label">'+f[0]+':</div><div class="value">'+f[1]+'</div>'});h+='</div>';document.getElementById('cdContent').innerHTML=h}
function rnIV(f){var tb=document.getElementById('iTB');tb.innerHTML='';var fl=D.iv.filter(function(iv){if(!f)return true;if(!ir(iv.iso,f.from,f.to))return false;if(!ms(iv.cn,f.name))return false;return true});lastFilteredIV=fl;fl.forEach(function(iv){var res=fivr(iv.code),oi=D.iv.indexOf(iv),ia=fia(iv.code);var tr=document.createElement('tr');tr.innerHTML='<td>'+iv.code+'</td><td>'+iv.cn+'</td><td>'+iv.pos+'</td><td>'+iv.ivrN+'</td><td>'+fdt(iv.time)+'</td><td>'+(iv.location||'')+'</td><td>'+iv.tests.join(',')+'</td><td>'+(res?'<span class="badge '+(res.result==='Đạt'?'badge-pass':'badge-fail')+'">'+res.result+'</span>'+(ia?' <span class="badge badge-ia">✓</span>':''):'<span class="badge badge-pending">Chờ</span>')+'</td><td class="op-stamp">'+(iv.opId||'')+' - '+(iv.opName||'')+'</td><td class="op-stamp">'+fdt(iv.iso)+'</td><td><button class="btn btn-edit" data-ivi="'+oi+'" style="font-size:.78em;padding:5px 8px">🖊</button></td>';tb.appendChild(tr)});tb.querySelectorAll('button[data-ivi]').forEach(function(b){b.addEventListener('click',function(){openEditIV(parseInt(this.getAttribute('data-ivi')))})});document.getElementById('iInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.iv.length}
function rnRes(f){var tb=document.getElementById('resTB');tb.innerHTML='';var fl=D.iv.filter(function(iv){if(!f)return true;if(!ms(iv.cn,f.name))return false;if(!ir(iv.iso,f.from,f.to))return false;return true});lastFilteredRes=fl;fl.forEach(function(iv){var res=fivr(iv.code),ia=fia(iv.code),not=fnot(iv.code);var tr=document.createElement('tr'),h='<td>'+iv.code+'</td><td>'+iv.cn+'</td><td>'+iv.pos+'</td><td>'+fdt(iv.time)+'</td>';if(res){h+='<td><span class="badge '+(res.result==='Đạt'?'badge-pass':'badge-fail')+'">'+res.result+'</span></td>';h+='<td>'+(ia?'<span class="badge badge-ia">✓ ('+ia.score+'/50)</span>':'<span class="badge badge-pending">Chưa</span>')+'</td>';h+='<td class="op-stamp">'+(res.opId||'')+' - '+(res.opName||'')+'</td><td class="op-stamp">'+(res.time||'')+'</td>';h+='<td>';if(res.result==='Đạt'&&ia&&!not)h+='<button class="btn btn-notify notBtn" data-ic="'+iv.code+'" style="font-size:.8em;padding:6px 10px">📧 TB</button>';else if(not)h+='<span class="badge badge-notified">📧 Đã TB</span>';else h+='✓';h+='</td>'}else{h+='<td><select class="rs" data-ic="'+iv.code+'" style="padding:6px;border-radius:6px;border:1px solid #ddd"><option value="">--</option><option value="Đạt">Đạt</option><option value="Không đạt">Không đạt</option></select></td><td>-</td><td>-</td><td>-</td><td><button class="btn btn-success sv" data-ic="'+iv.code+'" style="font-size:.8em;padding:6px 10px">Lưu</button></td>'}tr.innerHTML=h;tb.appendChild(tr)});tb.querySelectorAll('button.sv').forEach(function(b){b.addEventListener('click',function(){saveRes(this.getAttribute('data-ic'))})});tb.querySelectorAll('button.notBtn').forEach(function(b){b.addEventListener('click',function(){openNotifyForm(this.getAttribute('data-ic'))})})}
function rnOB(f){var tb=document.getElementById('oTB');tb.innerHTML='';var fl=D.ob.filter(function(ob){if(!f)return true;if(!ms(ob.cn,f.name))return false;var c=fcand(ob.cc);if(f.phone&&c&&!ms(c.phone,f.phone))return false;if(!ir(ob.pd,f.from,f.to))return false;return true});lastFilteredOB=fl;fl.forEach(function(ob){var oi=D.ob.indexOf(ob);var tr=document.createElement('tr');tr.innerHTML='<td>'+ob.cc+'</td><td><strong>'+ob.cn+'</strong></td><td>'+ob.pos+'</td><td>'+(ob.dept||'')+'</td><td>'+(ob.startDate?fd(ob.startDate):'')+'</td><td>'+(ob.trialSalary||ob.salary||'')+'</td><td><span class="badge '+(ob.st==='Đã XN'?'badge-confirmed':'badge-pending')+'">'+ob.st+'</span></td><td class="op-stamp">'+(ob.confirmOpId||'')+' '+(ob.confirmOpName||'')+'</td><td class="op-stamp">'+(ob.confirmTime||'')+'</td><td>'+(ob.st==='Chờ xác nhận'?'<button class="btn btn-success obBtn" data-oi="'+oi+'" style="font-size:.8em;padding:6px 10px">✅</button>':'<span class="badge badge-confirmed">✓</span>')+'</td>';tb.appendChild(tr)});tb.querySelectorAll('button.obBtn').forEach(function(b){b.addEventListener('click',function(){openOBForm(parseInt(this.getAttribute('data-oi')))})});document.getElementById('oInfo').innerHTML='<strong>'+fl.length+'</strong>/'+D.ob.length}
function saveRes(code){var sel=document.querySelector('.rs[data-ic="'+code+'"]');if(!sel||!sel.value){alert('Chọn kết quả!');return}if(sel.value==='Đạt'){openIAForm(code);return}D.ivr.push({ic:code,result:sel.value,note:'',opId:op.id,opName:op.name,time:ffdt()});log('KQ: '+sel.value,code);rnRes();saveToServer();alert('Đã lưu: Không đạt')}
function openIAForm(ivCode){var iv=fiv(ivCode);if(!iv)return;document.getElementById('iaForm').reset();document.getElementById('ia_ivCode').value=ivCode;document.getElementById('iaCandidate').innerHTML='<strong>'+iv.cn+'</strong> ('+iv.cc+') | Vị trí: '+iv.pos;document.getElementById('ia_evaluator').value=op.name;document.getElementById('iaTechScore').textContent='- / 25';document.getElementById('iaSoftScore').textContent='- / 25';document.getElementById('iaTotalScore').textContent='- / 50';document.getElementById('iaModal').classList.add('active')}
document.getElementById('iaForm').addEventListener('submit',function(e){e.preventDefault();var ivCode=document.getElementById('ia_ivCode').value,score=calcEvalScores();if(score===null){alert('Đánh giá tất cả tiêu chí!');return}if(!this.checkValidity()){this.reportValidity();return}var ev=document.getElementById('ia_evaluator').value.trim();if(!isUpper(ev)){alert('Tên IN HOA!');return}var fit=document.querySelector('input[name="ia_fit"]:checked'),con=document.querySelector('input[name="ia_conclusion"]:checked');if(!fit||!con){alert('Chọn mức phù hợp & kết luận!');return}D.ia.push({ic:ivCode,score:score,fit:fit.value,conclusion:con.value,proposedSalary:document.getElementById('ia_proposedSalary').value.trim(),comment:document.getElementById('ia_comment').value.trim(),evaluator:ev,evalTitle:document.getElementById('ia_evalTitle').value.trim(),opId:op.id,opName:op.name,time:ffdt()});var rm={'Đề xuất tuyển':'Đạt','Đề xuất dự bị':'Đạt','Không tuyển':'Không đạt'};D.ivr.push({ic:ivCode,result:rm[con.value]||'Đạt',note:'Điểm:'+score+'/50|'+con.value,opId:op.id,opName:op.name,time:ffdt()});log('KQ+Đánh giá',ivCode);document.getElementById('iaModal').classList.remove('active');rnRes();saveToServer();alert('Đã lưu!')});
document.getElementById('btnCloseIA').addEventListener('click',function(){document.getElementById('iaModal').classList.remove('active')});
function openNotifyForm(ivCode){var iv=fiv(ivCode);if(!iv)return;var ia=fia(ivCode);document.getElementById('nf_ivCode').value=ivCode;document.getElementById('nfCandidate').innerHTML='<strong>'+iv.cn+'</strong> ('+iv.cc+')<br>Vị trí: '+iv.pos+(ia?'<br>Điểm: <strong>'+ia.score+'/50</strong> | '+ia.conclusion:'');document.getElementById('nf_position').value=iv.pos;document.getElementById('nf_dept').value=iv.dept||'';document.getElementById('nf_salary').value=ia?ia.proposedSalary:'';document.getElementById('nf_trialSalary').value='';document.getElementById('notifyModal').classList.add('active')}
document.getElementById('nf_busRegister').addEventListener('change',function(){document.getElementById('nf_busDetails').style.display=this.checked?'flex':'none'});
document.getElementById('notifyForm').addEventListener('submit',function(e){e.preventDefault();if(!this.checkValidity()){this.reportValidity();return}var ivCode=document.getElementById('nf_ivCode').value,iv=fiv(ivCode);if(!iv)return;var al=[];document.querySelectorAll('input[name="nf_allowance"]:checked').forEach(function(c){al.push(c.value)});var pm=document.querySelector('input[name="nf_payMethod"]:checked');var nd={ic:ivCode,cc:iv.cc,cn:iv.cn,pos:document.getElementById('nf_position').value,dept:document.getElementById('nf_dept').value,trialSalary:document.getElementById('nf_trialSalary').value.trim(),salary:document.getElementById('nf_salary').value.trim(),allowances:al,bhSalary:document.getElementById('nf_bhSalary').value.trim(),payMethod:pm?pm.value:'',startDate:document.getElementById('nf_startDate').value,deadline:document.getElementById('nf_deadline').value,busRegister:document.getElementById('nf_busRegister').checked,busRoute:document.getElementById('nf_busRoute').value.trim(),busStop:document.getElementById('nf_busStop').value.trim(),note:document.getElementById('nf_note').value.trim(),opId:op.id,opName:op.name,time:ffdt()};D.notify.push(nd);if(!fob(iv.cc))D.ob.push({cc:iv.cc,cn:iv.cn,pos:nd.pos,dept:nd.dept,startDate:nd.startDate,deadline:nd.deadline,trialSalary:nd.trialSalary,salary:nd.salary,pd:gn(),st:'Chờ xác nhận'});log('TB trúng tuyển',iv.cn);document.getElementById('notifyModal').classList.remove('active');rnRes();saveToServer();alert('Đã gửi TB!')});
document.getElementById('btnCloseNotify').addEventListener('click',function(){document.getElementById('notifyModal').classList.remove('active')});
function openOBForm(i){var ob=D.ob[i];if(!ob)return;var c=fcand(ob.cc);document.getElementById('ob_idx').value=i;document.getElementById('ob_name').value=ob.cn;document.getElementById('ob_empId').value='';document.getElementById('ob_startDate').value=ob.startDate||'';document.getElementById('ob_phone').value=c?c.phone:'';document.getElementById('ob_personalEmail').value=c?c.email:'';document.getElementById('ob_confirm').checked=false;document.getElementById('obCandInfo').innerHTML='<strong>'+ob.cn+'</strong> ('+ob.cc+')'+(c?'<br>SĐT: '+c.phone:'')+'<br>Vị trí: '+ob.pos;document.getElementById('obFormModal').classList.add('active')}
document.getElementById('obForm').addEventListener('submit',function(e){e.preventDefault();if(!document.getElementById('ob_confirm').checked){alert('Xác nhận!');return}if(!document.getElementById('ob_empId').value.trim()){alert('Nhập mã NV!');return}var idx=parseInt(document.getElementById('ob_idx').value),ob=D.ob[idx];if(!ob)return;var ckItems=['ck_cccd','ck_cv2','ck_health','ck_degree','ck_birth'],ck={},t=0,ch=0;ckItems.forEach(function(id){var cb=document.getElementById(id);ck[id]=cb.checked;t++;if(cb.checked)ch++});ob.st='Đã XN';ob.newEmpId=document.getElementById('ob_empId').value.trim();ob.actualStartDate=document.getElementById('ob_startDate').value;ob.checklist=ck;ob.checklistScore=ch+'/'+t;ob.confirmOpId=op.id;ob.confirmOpName=op.name;ob.confirmTime=ffdt();log('XN nhận việc',ob.cn+' - '+ob.newEmpId);document.getElementById('obFormModal').classList.remove('active');rnOB();saveToServer();alert(' Xác nhận: '+ob.cn)});
document.getElementById('btnCloseOBForm').addEventListener('click',function(){document.getElementById('obFormModal').classList.remove('active')});
function openEditR(i){var r=D.r[i];document.getElementById('rf_ei').value=i;document.getElementById('rfTitle').textContent='🖊 Sửa: '+r.code;document.getElementById('rfBanner').style.display='flex';document.getElementById('rfCode').textContent=r.code;document.getElementById('rfBtn').textContent='💾 Cập nhật';document.getElementById('rf_dept').value=r.dept;document.getElementById('rf_proposer').value=r.proposer;document.getElementById('rf_position').value=r.position;document.getElementById('rf_level').value=r.level;document.getElementById('rf_qty').value=r.qty;document.querySelectorAll('input[name="rf_type"]').forEach(function(cb){cb.checked=r.types.indexOf(cb.value)>=0});document.querySelectorAll('input[name="rf_reason"]').forEach(function(cb){cb.checked=r.reasons.indexOf(cb.value)>=0});document.getElementById('rf_startDate').value=r.startDate||'';document.getElementById('rf_jd').value=r.jd||'';document.getElementById('rf_responsibilities').value=r.responsibilities||'';document.getElementById('rf_edu').value=r.edu||'';document.getElementById('rf_exp').value=r.exp||'';document.getElementById('rf_skills').value=r.skills||'';document.getElementById('rf_salary').value=r.salary||'';document.getElementById('rf_reportTo').value=r.reportTo||'';document.getElementById('rf_major').value=r.major||'';document.getElementById('rf_softSkills').value=r.softSkills||'';document.getElementById('rf_language').value=r.language||'';document.getElementById('rf_cert').value=r.cert||'';document.getElementById('rf_deadline').value=r.deadline||'';document.getElementById('rf_salaryRange').value=r.salaryRange||'';if(r.location){var lr=document.querySelector('input[name="rf_location"][value="'+r.location+'"]');if(lr)lr.checked=true}if(r.workTime){var wr=document.querySelector('input[name="rf_workTime"][value="'+r.workTime+'"]');if(wr)wr.checked=true}document.getElementById('rf_ap1').value=r.ap1||'';document.getElementById('rf_ap1s').value=r.ap1s;document.getElementById('rf_ap2').value=r.ap2||'';document.getElementById('rf_ap2s').value=r.ap2s;document.getElementById('rf_ap3').value=r.ap3||'';document.getElementById('rf_ap3s').value=r.ap3s;show('recrFormView')}
function openEditC(i){var c=D.c[i];document.getElementById('cf_ei').value=i;document.getElementById('cfTitle').textContent='🖊 Sửa: '+c.code;document.getElementById('cfBanner').style.display='flex';document.getElementById('cfCode').textContent=c.code;document.getElementById('cfBtn').textContent='💾 Cập nhật';document.getElementById('cf_bophan').value=c.bophan||'';document.getElementById('cf_ivDate').value=c.ivDate||'';document.getElementById('cf_sobaodanh').value=c.sobaodanh||'';document.getElementById('cf_name').value=c.name;document.getElementById('cf_dob').value=c.dob;document.getElementById('cf_gender').value=c.gender;document.getElementById('cf_ethnic').value=c.ethnic||'';if(c.marital){var mr=document.querySelector('input[name="cf_marital"][value="'+c.marital+'"]');if(mr)mr.checked=true}document.getElementById('cf_children').value=c.children||0;document.getElementById('cf_childAge').value=c.childAge||'';document.getElementById('cf_cccd').value=c.cccd;document.getElementById('cf_cccdDate').value=c.cccdDate||'';document.getElementById('cf_cccdPlace').value=c.cccdPlace||'';document.getElementById('cf_cccdExpiry').value=c.cccdExpiry||'';document.getElementById('cf_phone').value=c.phone;document.getElementById('cf_relativePhone').value=c.relativePhone||'';document.getElementById('cf_permAddr').value=c.permAddr||'';document.getElementById('cf_permWard').value=c.permWard||'';document.getElementById('cf_permCity').value=c.permCity||'';document.getElementById('cf_currAddr').value=c.currAddr||'';document.getElementById('cf_currWard').value=c.currWard||'';document.getElementById('cf_currCity').value=c.currCity||'';document.getElementById('cf_height').value=c.height||'';document.getElementById('cf_weight').value=c.weight||'';document.getElementById('cf_shoeSize').value=c.shoeSize||'';document.getElementById('cf_email').value=c.email||'';document.getElementById('cf_edu').value=c.edu;document.getElementById('cf_school').value=c.school||'';document.getElementById('cf_gradYear').value=c.gradYear||'';document.getElementById('cf_major').value=c.major||'';setExpData(c.experiences);if(c.prevIV){var pv=document.querySelector('input[name="cf_prevIV"][value="'+c.prevIV+'"]');if(pv)pv.checked=true;if(c.prevIV==='Đã PV')document.getElementById('cf_prevIVDetail').style.display='flex'}document.getElementById('cf_prevIVTimes').value=c.prevIVTimes||'';document.getElementById('cf_prevIVWhen').value=c.prevIVWhen||'';if(c.availTime){var at=document.querySelector('input[name="cf_availTime"][value="'+c.availTime+'"]');if(at)at.checked=true;if(c.availTime==='Chọn ngày')document.getElementById('cf_availDateWrap').style.display='flex'}document.getElementById('cf_availDate').value=c.availDate||'';document.getElementById('cf_availReason').value=c.availReason||'';if(c.smoke){var sm=document.querySelector('input[name="cf_smoke"][value="'+c.smoke+'"]');if(sm)sm.checked=true}if(c.disease){var ds=document.querySelector('input[name="cf_disease"][value="'+c.disease+'"]');if(ds)ds.checked=true}document.querySelectorAll('input[name="cf_src"]').forEach(function(cb){cb.checked=c.sources?c.sources.indexOf(cb.value)>=0:false});document.getElementById('cf_channel').value=c.channel||'';if(c.bus){var bs=document.querySelector('input[name="cf_bus"][value="'+c.bus+'"]');if(bs)bs.checked=true;if(c.bus==='Có')document.getElementById('cf_busDetailWrap').style.display='flex'}document.getElementById('cf_busStop').value=c.busStop||'';document.getElementById('cf_chinese').value=c.chinese||'Không';document.getElementById('cf_english').value=c.english||'Không';document.getElementById('cf_expYears').value=c.expYears||0;if(c.wishes){document.getElementById('cf_wish1').value=c.wishes[0]||'';document.getElementById('cf_wish2').value=c.wishes[1]||'';document.getElementById('cf_wish3').value=c.wishes[2]||''}document.getElementById('cf_commit').checked=true;loadCVForEdit(i);show('candFormView')}
function openSched(i){var c=D.c[i];document.getElementById('si_ci').value=i;document.getElementById('si_ei').value=-1;document.getElementById('sfTitle').textContent='Đặt Lịch PV';document.getElementById('sfBanner').style.display='none';document.getElementById('sfBtn').textContent='✅ Xác nhận';document.getElementById('sfInfo').innerHTML='<div class="candidate-detail-card"><strong>'+c.name+'</strong> ('+c.code+') | '+c.phone+'</div>';document.getElementById('si_name').value='';document.getElementById('si_id').value='';document.getElementById('si_title').value='';document.getElementById('si_time').value='';document.getElementById('si_location').value='';document.getElementById('si_ivPosition').value='';document.querySelectorAll('input[name="si_test"]').forEach(function(cb){cb.checked=false});show('schedFormView')}
function openEditIV(i){var iv=D.iv[i],ci=D.c.findIndex(function(c){return c.code===iv.cc});document.getElementById('si_ei').value=i;document.getElementById('si_ci').value=ci;document.getElementById('sfTitle').textContent='🖊 Sửa: '+iv.code;document.getElementById('sfBanner').style.display='flex';document.getElementById('sfCode').textContent=iv.code;document.getElementById('sfBtn').textContent='💾 Cập nhật';document.getElementById('sfInfo').innerHTML='<div class="candidate-detail-card"><strong>'+iv.cn+'</strong> ('+iv.cc+')</div>';document.getElementById('si_name').value=iv.ivrN;document.getElementById('si_id').value=iv.ivrId;document.getElementById('si_title').value=iv.ivrT||'';document.getElementById('si_time').value=iv.time||'';document.getElementById('si_location').value=iv.location||'';document.getElementById('si_ivPosition').value=iv.pos||'';document.querySelectorAll('input[name="si_test"]').forEach(function(cb){cb.checked=iv.tests.indexOf(cb.value)>=0});show('schedFormView')}
function valR(){var v=true,p=document.getElementById('rf_proposer').value.trim();if(!isUpper(p)){document.getElementById('err_rf_proposer').style.display='block';v=false}else document.getElementById('err_rf_proposer').style.display='none';if(!document.querySelectorAll('input[name="rf_type"]:checked').length){document.getElementById('err_rf_type').style.display='block';v=false}else document.getElementById('err_rf_type').style.display='none';if(!document.querySelectorAll('input[name="rf_reason"]:checked').length){document.getElementById('err_rf_reason').style.display='block';v=false}else document.getElementById('err_rf_reason').style.display='none';var ei=parseInt(document.getElementById('rf_ei').value),pos=document.getElementById('rf_position').value.trim(),dept=document.getElementById('rf_dept').value;if(pos&&dept&&checkDupRecr(pos,dept,ei)){document.getElementById('rfDupWarn').style.display='flex';document.getElementById('rfDupMsg').textContent='Trùng: "'+pos+'" - "'+dept+'"';v=false}else document.getElementById('rfDupWarn').style.display='none';return v}
function valC(){var v=true,ck=function(e,t){if(!t){document.getElementById(e).style.display='block';v=false}else document.getElementById(e).style.display='none'};ck('err_cf_name',isUpper(document.getElementById('cf_name').value.trim()));ck('err_cf_dob',!!document.getElementById('cf_dob').value);ck('err_cf_gender',!!document.getElementById('cf_gender').value);ck('err_cf_bophan',!!document.getElementById('cf_bophan').value);ck('err_cf_cccd',/^\\d{12}$/.test(document.getElementById('cf_cccd').value.trim()));var ph=document.getElementById('cf_phone').value.trim();ck('err_cf_phone',/^0\\d{9}$/.test(ph));var ei=parseInt(document.getElementById('cf_ei').value);if(checkDupCandPhone(ph,ei)){document.getElementById('err_cf_phone_dup').style.display='block';v=false}else document.getElementById('err_cf_phone_dup').style.display='none';var em=document.getElementById('cf_email').value.trim();if(em){if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(em)){document.getElementById('err_cf_email').style.display='block';v=false}else document.getElementById('err_cf_email').style.display='none';if(checkDupCandEmail(em,ei)){document.getElementById('err_cf_email_dup').style.display='block';v=false}else document.getElementById('err_cf_email_dup').style.display='none'}else{document.getElementById('err_cf_email').style.display='none';document.getElementById('err_cf_email_dup').style.display='none'}ck('err_cf_perm',!!document.getElementById('cf_permAddr').value.trim());ck('err_cf_marital',!!document.querySelector('input[name="cf_marital"]:checked'));ck('err_cf_prevIV',!!document.querySelector('input[name="cf_prevIV"]:checked'));ck('err_cf_availTime',!!document.querySelector('input[name="cf_availTime"]:checked'));ck('err_cf_wish1',!!document.getElementById('cf_wish1').value.trim());ck('err_cf_edu',!!document.getElementById('cf_edu').value);ck('err_cf_src',document.querySelectorAll('input[name="cf_src"]:checked').length>0);if(!document.getElementById('cf_commit').checked){document.getElementById('err_cf_commit').style.display='block';v=false}else document.getElementById('err_cf_commit').style.display='none';return v}
function valSI(){var v=true,nm=document.getElementById('si_name').value.trim();if(!isUpper(nm)){document.getElementById('err_si_name').style.display='block';v=false}else document.getElementById('err_si_name').style.display='none';var t=document.getElementById('si_title').value;if(!t||t==='Nhân viên'||t==='Kỹ sư'){document.getElementById('err_si_level').style.display='block';v=false}else document.getElementById('err_si_level').style.display='none';if(!document.querySelectorAll('input[name="si_test"]:checked').length){document.getElementById('err_si_test').style.display='block';v=false}else document.getElementById('err_si_test').style.display='none';document.getElementById('err_si_dup_time').style.display='none';return v}
document.querySelectorAll('input[name="cf_prevIV"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_prevIVDetail').style.display=this.value==='Đã PV'?'flex':'none'})});
document.querySelectorAll('input[name="cf_availTime"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_availDateWrap').style.display=this.value==='Chọn ngày'?'flex':'none'})});
document.querySelectorAll('input[name="cf_bus"]').forEach(function(r){r.addEventListener('change',function(){document.getElementById('cf_busDetailWrap').style.display=this.value==='Có'?'flex':'none'})});
document.querySelectorAll('.uppercase-input').forEach(function(inp){inp.addEventListener('input',function(){var p=this.selectionStart;this.value=this.value.toUpperCase();this.setSelectionRange(p,p)})});
document.getElementById('loginForm').addEventListener('submit',function(e){e.preventDefault();var id=document.getElementById('login_empId').value.trim(),nm=document.getElementById('login_empName').value.trim().toUpperCase(),dp=document.getElementById('login_empDept').value,tt=document.getElementById('login_empTitle').value;if(!id||!nm||!dp||!tt||!isUpper(nm)){document.getElementById('loginError').style.display='block';return}op={id:id,name:nm,dept:dp,title:tt};document.getElementById('loginOverlay').style.display='none';document.getElementById('operatorBar').style.display='flex';document.getElementById('dispEmpId').textContent=id;document.getElementById('dispEmpName').textContent=nm;document.getElementById('dispEmpDept').textContent=dp;document.getElementById('dispEmpTitle').textContent=tt;startClock();log('Đăng nhập');show('mainView')});
document.getElementById('btnChangeOp').addEventListener('click',function(){log('Đăng xuất');document.getElementById('loginOverlay').style.display='flex';document.getElementById('operatorBar').style.display='none';show('mainView')});
document.getElementById('btnGoRecr').addEventListener('click',function(){rnR();show('recrListView')});
document.getElementById('btnGoCand').addEventListener('click',function(){rnC();show('candListView')});
document.getElementById('btnGoIV').addEventListener('click',function(){rnIV();saveToServer();show('ivListView')});
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
document.getElementById('btnNewRecr').addEventListener('click',function(){resetF('recrForm');document.getElementById('rf_ei').value=-1;document.getElementById('rfTitle').textContent='Tạo Nhu Cầu';document.getElementById('rfBanner').style.display='none';document.getElementById('rfBtn').textContent='💾 Lưu';document.getElementById('rfDupWarn').style.display='none';show('recrFormView')});
document.getElementById('btnNewCand').addEventListener('click',function(){resetF('candForm');document.getElementById('cf_ei').value=-1;document.getElementById('cfTitle').textContent='THÔNG TIN TRƯỚC PHỎNG VẤN';document.getElementById('cfBanner').style.display='none';document.getElementById('cfBtn').textContent='💾 Lưu';clearCV();setExpData([]);document.getElementById('cf_prevIVDetail').style.display='none';document.getElementById('cf_availDateWrap').style.display='none';document.getElementById('cf_busDetailWrap').style.display='none';show('candFormView')});
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
document.getElementById('recrForm').addEventListener('submit',function(e){e.preventDefault();if(!valR())return;if(!this.checkValidity()){this.reportValidity();return}var types=[],reasons=[];document.querySelectorAll('input[name="rf_type"]:checked').forEach(function(c){types.push(c.value)});document.querySelectorAll('input[name="rf_reason"]:checked').forEach(function(c){reasons.push(c.value)});var ei=parseInt(document.getElementById('rf_ei').value),isE=ei>=0;var lr=document.querySelector('input[name="rf_location"]:checked'),wr=document.querySelector('input[name="rf_workTime"]:checked');var rec={code:isE?D.r[ei].code:gc(),dept:document.getElementById('rf_dept').value,proposer:document.getElementById('rf_proposer').value.trim().toUpperCase(),position:document.getElementById('rf_position').value.trim(),level:document.getElementById('rf_level').value,qty:document.getElementById('rf_qty').value,types:types,reasons:reasons,startDate:document.getElementById('rf_startDate').value,reportTo:document.getElementById('rf_reportTo').value.trim(),location:lr?lr.value:'',workTime:wr?wr.value:'',salary:document.getElementById('rf_salary').value.trim(),salaryRange:document.getElementById('rf_salaryRange').value.trim(),jd:document.getElementById('rf_jd').value.trim(),responsibilities:document.getElementById('rf_responsibilities').value.trim(),edu:document.getElementById('rf_edu').value,exp:document.getElementById('rf_exp').value,major:document.getElementById('rf_major').value.trim(),skills:document.getElementById('rf_skills').value.trim(),softSkills:document.getElementById('rf_softSkills').value.trim(),language:document.getElementById('rf_language').value.trim(),cert:document.getElementById('rf_cert').value.trim(),deadline:document.getElementById('rf_deadline').value,ap1:document.getElementById('rf_ap1').value.trim().toUpperCase(),ap1s:document.getElementById('rf_ap1s').value,ap2:document.getElementById('rf_ap2').value.trim().toUpperCase(),ap2s:document.getElementById('rf_ap2s').value,ap3:document.getElementById('rf_ap3').value.trim().toUpperCase(),ap3s:document.getElementById('rf_ap3s').value,dateStr:isE?D.r[ei].dateStr:fd(new Date()),iso:isE?D.r[ei].iso:gn(),opId:op.id,opName:op.name};if(isE){D.r[ei]=rec;log('Cập nhật NC',rec.code);alert('Cập nhật: '+rec.code)}else{D.r.push(rec);log('Tạo NC',rec.code);alert('Tạo: '+rec.code)}curRC=rec.code;rnRD(rec.code);curRC=rec.code;rnRD(rec.code);saveToServer();show('recrDetailView')});show('recrDetailView')});
document.getElementById('candForm').addEventListener('submit',function(e){e.preventDefault();if(!valC()){var fe=this.querySelector('.error-msg[style*="block"]');if(fe)fe.scrollIntoView({behavior:'smooth',block:'center'});return}var sources=[];document.querySelectorAll('input[name="cf_src"]:checked').forEach(function(c){sources.push(c.value)});var ei=parseInt(document.getElementById('cf_ei').value),isE=ei>=0;var wishes=[document.getElementById('cf_wish1').value.trim(),document.getElementById('cf_wish2').value.trim(),document.getElementById('cf_wish3').value.trim()];var maritalR=document.querySelector('input[name="cf_marital"]:checked');var prevIVR=document.querySelector('input[name="cf_prevIV"]:checked');var availTimeR=document.querySelector('input[name="cf_availTime"]:checked');var smokeR=document.querySelector('input[name="cf_smoke"]:checked');var diseaseR=document.querySelector('input[name="cf_disease"]:checked');var busR=document.querySelector('input[name="cf_bus"]:checked');var rec={code:isE?D.c[ei].code:gcc(D.c.length+1),bophan:document.getElementById('cf_bophan').value,ivDate:document.getElementById('cf_ivDate').value,sobaodanh:document.getElementById('cf_sobaodanh').value.trim(),name:document.getElementById('cf_name').value.trim().toUpperCase(),dob:document.getElementById('cf_dob').value,gender:document.getElementById('cf_gender').value,ethnic:document.getElementById('cf_ethnic').value.trim(),marital:maritalR?maritalR.value:'',children:document.getElementById('cf_children').value,childAge:document.getElementById('cf_childAge').value.trim(),cccd:document.getElementById('cf_cccd').value.trim(),cccdDate:document.getElementById('cf_cccdDate').value,cccdPlace:document.getElementById('cf_cccdPlace').value.trim(),cccdExpiry:document.getElementById('cf_cccdExpiry').value,phone:document.getElementById('cf_phone').value.trim(),relativePhone:document.getElementById('cf_relativePhone').value.trim(),permAddr:document.getElementById('cf_permAddr').value.trim(),permWard:document.getElementById('cf_permWard').value.trim(),permCity:document.getElementById('cf_permCity').value.trim(),currAddr:document.getElementById('cf_currAddr').value.trim(),currWard:document.getElementById('cf_currWard').value.trim(),currCity:document.getElementById('cf_currCity').value.trim(),height:document.getElementById('cf_height').value,weight:document.getElementById('cf_weight').value,shoeSize:document.getElementById('cf_shoeSize').value.trim(),email:document.getElementById('cf_email').value.trim(),edu:document.getElementById('cf_edu').value,school:document.getElementById('cf_school').value.trim(),gradYear:document.getElementById('cf_gradYear').value.trim(),major:document.getElementById('cf_major').value.trim(),experiences:getExpData(),prevIV:prevIVR?prevIVR.value:'',prevIVTimes:document.getElementById('cf_prevIVTimes').value.trim(),prevIVWhen:document.getElementById('cf_prevIVWhen').value.trim(),availTime:availTimeR?availTimeR.value:'',availDate:document.getElementById('cf_availDate').value,availReason:document.getElementById('cf_availReason').value.trim(),smoke:smokeR?smokeR.value:'',disease:diseaseR?diseaseR.value:'',sources:sources,channel:document.getElementById('cf_channel').value.trim(),bus:busR?busR.value:'',busStop:document.getElementById('cf_busStop').value.trim(),chinese:document.getElementById('cf_chinese').value,english:document.getElementById('cf_english').value,expYears:document.getElementById('cf_expYears').value||0,wishes:wishes,position:wishes[0]||'',recrCode:'',iso:isE?D.c[ei].iso:gn(),opId:op.id,opName:op.name};var saveIdx;if(isE){D.c[ei]=rec;saveIdx=ei;log('Cập nhật UV',rec.code);alert('Cập nhật: '+rec.name)}else{D.c.push(rec);saveIdx=D.c.length-1;log('Thêm UV',rec.code);alert('Thêm: '+rec.name+' ('+rec.code+')')}if(pendingCV){cvStore[saveIdx]=pendingCV}else if(!pendingCV&&isE){delete cvStore[saveIdx]}rnCD(saveIdx);show('candDetailView')});
document.getElementById('schedForm').addEventListener('submit',function(e){e.preventDefault();if(!valSI()||!this.checkValidity()){this.reportValidity();return}var ci=parseInt(document.getElementById('si_ci').value),c=D.c[ci];var ei=parseInt(document.getElementById('si_ei').value),isE=ei>=0;var time=document.getElementById('si_time').value;if(checkDupIVTime(time,isE?ei:-999)){document.getElementById('err_si_dup_time').style.display='block';alert('Trùng thời gian!');return}document.getElementById('err_si_dup_time').style.display='none';var tests=[];document.querySelectorAll('input[name="si_test"]:checked').forEach(function(cb){tests.push(cb.value)});var posName=document.getElementById('si_ivPosition').value.trim();var rec={code:isE?D.iv[ei].code:gic(),ci:ci,cc:c.code,cn:c.name,pos:posName,ivrN:document.getElementById('si_name').value.trim().toUpperCase(),ivrId:document.getElementById('si_id').value.trim(),ivrT:document.getElementById('si_title').value,time:time,location:document.getElementById('si_location').value,ivPositionCode:'',tests:tests,iso:isE?D.iv[ei].iso:gn(),opId:op.id,opName:op.name};if(isE){D.iv[ei]=rec;log('Cập nhật PV',rec.code);alert('Cập nhật: '+rec.code)}else{D.iv.push(rec);log('Đặt lịch PV',rec.code);alert('Đặt lịch: '+rec.code)}rnIV();saveToServer();show('ivListView')});
document.getElementById('rf_position').addEventListener('input',checkRecrDupLive);
document.getElementById('rf_dept').addEventListener('change',checkRecrDupLive);
function checkRecrDupLive(){var pos=document.getElementById('rf_position').value.trim(),dept=document.getElementById('rf_dept').value,ei=parseInt(document.getElementById('rf_ei').value);if(pos&&dept&&checkDupRecr(pos,dept,ei)){document.getElementById('rfDupWarn').style.display='flex';document.getElementById('rfDupMsg').textContent='Trùng: "'+pos+'" - "'+dept+'"'}else document.getElementById('rfDupWarn').style.display='none'}
initCVUpload();
// ====== SAVE / LOAD SERVER ======
function saveToServer(){
    var payload = {
        D: D,
        RC: RC,
        IC: IC,
        cvStore: cvStore
    };
    fetch('/api/data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    }).then(function(r){return r.json()}).then(function(j){
        if(!j.success) console.error('Lưu thất bại');
    }).catch(function(e){console.error('Lỗi lưu:',e)});
}

function loadFromServer(){
    fetch('/api/data').then(function(r){return r.json()}).then(function(data){
        if(data && data.D){
            D = data.D;
            RC = data.RC || 1;
            IC = data.IC || 1;
            cvStore = data.cvStore || {};
            console.log('Đã load data từ server');
        }
    }).catch(function(e){console.error('Lỗi load:',e)});
}

// Load data khi trang mở
loadFromServer();
</script>
</body>
</html>`;

// ====== DATA FILE PATH ======
const DATA_FILE = path.join(__dirname, 'data.json');

// Đọc data từ file
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Lỗi đọc data.json:', e.message);
    }
    return null;
}

// Ghi data vào file
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('Lỗi ghi data.json:', e.message);
        return false;
    }
}

const server = http.createServer((req, res) => {
    // CORS headers (nếu cần)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve trang HTML
    if ((req.url === '/' || req.url === '/index.html') && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_CONTENT);
        return;
    }

    // API: Load data
    if (req.url === '/api/data' && req.method === 'GET') {
        const data = loadData();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data || {}));
        return;
    }

    // API: Save data
    if (req.url === '/api/data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            // Giới hạn 50MB để tránh tấn công
            if (body.length > 50 * 1024 * 1024) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Payload quá lớn' }));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const ok = saveData(data);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: ok }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'JSON không hợp lệ' }));
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}/`);
    console.log('Mở Chrome và truy cập http://localhost:3000/');
    console.log(`Data sẽ được lưu tại: ${DATA_FILE}`);
});