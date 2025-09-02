// 全局变量
let records = [];
let currentType = 'expense';
let selectedImages = [];
let currentDate = new Date();
let selectedDay = null;
let ledgers = [];
let currentLedgerId = null;

// 定义收入和支出的分类
const categories = {
    expense: {
        '餐饮': ['外卖', '正餐', '零食', '饮料', '水果', '其他餐饮'],
        '交通': ['公交', '地铁', '打车', '加油', '停车费', '其他交通'],
        '购物': ['日用品', '服装', '电子产品', '化妆品', '书籍', '其他购物'],
        '娱乐': ['电影', '游戏', '旅游', 'KTV', '健身', '其他娱乐'],
        '住房': ['房租', '水电费', '物业费', '网费', '其他住房'],
        '医疗': ['药品', '诊疗费', '体检', '其他医疗'],
        '教育': ['学费', '教材', '培训', '其他教育'],
        '其他支出': ['红包', '捐赠', '其他']
    },
    income: {
        '工资': ['基本工资', '奖金', '补贴', '其他工资'],
        '兼职': ['兼职收入', '副业', '其他兼职'],
        '投资': ['股票', '基金', '利息', '其他投资'],
        '礼金': ['红包', '礼金', '其他礼金'],
        '其他收入': ['零花钱', '卖货', '退款', '其他']
    }
};

// DOM 元素
const amountInput = document.getElementById('amount');
const mainCategorySelect = document.getElementById('main-category');
const subCategorySelect = document.getElementById('sub-category');
const dateInput = document.getElementById('date');
const descriptionTextarea = document.getElementById('description');
const addImageBtn = document.getElementById('add-image');
const imagePreview = document.getElementById('image-preview');
const expenseBtn = document.getElementById('expense');
const incomeBtn = document.getElementById('income');
const addRecordBtn = document.getElementById('add-record');
const recordsList = document.getElementById('records-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthEl = document.getElementById('current-month');
const calendarDays = document.getElementById('calendar-days');
const selectedDayRecords = document.getElementById('selected-day-records');
// 筛选相关元素
const filterTypeSelect = document.getElementById('filter-type');
const filterMainCategorySelect = document.getElementById('filter-main-category');
const filterSubCategorySelect = document.getElementById('filter-sub-category');
const clearFilterBtn = document.getElementById('clear-filter');
// 设置相关元素
const customColorInput = document.getElementById('custom-color');
const colorOptions = document.querySelectorAll('.color-option');
const bgTypeSelect = document.getElementById('bg-type');
const bgColorInput = document.getElementById('bg-color');
const bgColorGroup = document.getElementById('bg-color-group');
const bgImageInput = document.getElementById('bg-image');
const bgImageGroup = document.getElementById('bg-image-group');
const removeBgImageBtn = document.getElementById('remove-bg-image');
const buttonStyleRadios = document.querySelectorAll('input[name="button-style"]');
const resetSettingsBtn = document.getElementById('reset-settings');
const settingsTab = document.getElementById('settings-tab');

// 应用设置
const settings = {
  themeColor: '#16a34a',
  isDarkMode: false,
  buttonStyle: 'default',
  bgType: 'solid',
  bgColor: '#f8fafc',
  bgImage: ''
};

// 从本地存储加载设置
function loadSettings() {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings));
    applyTheme();
    applyButtonStyle();
    applyBackgroundSettings();
    updateSettingsUI();
  }
}

// 加载账本数据
function loadLedgers() {
  try {
    const storedLedgers = localStorage.getItem('financeLedgers');
    if (storedLedgers) {
      ledgers = JSON.parse(storedLedgers);
    }
    
    // 如果没有账本，创建默认账本
    if (ledgers.length === 0) {
      createLedger('默认账本');
    }
  } catch (error) {
    console.error('加载账本失败:', error);
    ledgers = [];
  }
}

// 保存设置到本地存储
function saveSettings() {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

// 创建新账本
function createLedger(name) {
  const newLedger = {
    id: Date.now(),
    name: name,
    createdAt: new Date().toISOString()
  };
  
  ledgers.push(newLedger);
  saveLedgers();
  
  // 如果是第一个账本，自动切换到该账本
  if (ledgers.length === 1) {
    switchToLedger(newLedger.id);
  }
  
  return newLedger;
}

// 保存账本列表
function saveLedgers() {
  try {
    localStorage.setItem('financeLedgers', JSON.stringify(ledgers));
  } catch (error) {
    console.error('保存账本失败:', error);
  }
}

// 切换到指定账本
function switchToLedger(ledgerId) {
  currentLedgerId = ledgerId;
  loadCurrentLedgerRecords();
  updateLedgerUI();
  renderLedgersList(); // 更新设置页面的账本列表
  
  // 显示切换成功提示
  const currentLedger = ledgers.find(l => l.id === ledgerId);
  if (currentLedger) {
    showToast(`已切换到"${currentLedger.name}"`);
  }
}

// 更新账本UI
function updateLedgerUI() {
  // 更新账本选择下拉框
  const ledgerSelect = document.getElementById('ledger-select');
  if (ledgerSelect) {
    ledgerSelect.innerHTML = '';
    ledgers.forEach(ledger => {
      const option = document.createElement('option');
      option.value = ledger.id;
      option.textContent = ledger.name;
      if (ledger.id === currentLedgerId) {
        option.selected = true;
      }
      ledgerSelect.appendChild(option);
    });
  }
  
  // 更新当前账本显示
  const currentLedgerNameEl = document.getElementById('current-ledger-name');
  if (currentLedgerNameEl) {
    const currentLedger = ledgers.find(l => l.id === currentLedgerId);
    currentLedgerNameEl.textContent = currentLedger ? currentLedger.name : '默认账本';
  }
}

// 创建新账本（从表单）
function createNewLedger() {
  const newLedgerInput = document.getElementById('new-ledger-name');
  if (!newLedgerInput) return;
  
  const name = newLedgerInput.value.trim();
  if (!name) {
    showToast('请输入账本名称');
    return;
  }
  
  // 检查账本名称是否已存在
  if (ledgers.some(ledger => ledger.name === name)) {
    showToast('账本名称已存在');
    return;
  }
  
  // 创建新账本
  const newLedger = createLedger(name);
  
  // 清空输入框
  newLedgerInput.value = '';
  
  // 更新账本列表
  renderLedgersList();
  
  // 切换到新账本
  switchToLedger(newLedger.id);
}

// 渲染账本列表
function renderLedgersList() {
  const ledgersList = document.getElementById('ledgers-list');
  if (!ledgersList) return;
  
  ledgersList.innerHTML = '';
  
  if (ledgers.length === 0) {
    ledgersList.innerHTML = '<p class="no-ledgers">暂无账本</p>';
    return;
  }
  
  ledgers.forEach(ledger => {
    const ledgerItem = document.createElement('div');
    ledgerItem.className = 'ledger-item';
    
    const isCurrent = ledger.id === currentLedgerId;
    
    ledgerItem.innerHTML = `
      <span class="ledger-name ${isCurrent ? 'current' : ''}">${ledger.name}</span>
      <span class="ledger-date">创建于 ${formatLedgerDate(ledger.createdAt)}</span>
      <div class="ledger-actions">
        ${isCurrent ? '<span class="current-tag">当前</span>' : 
          `<button class="switch-ledger-btn" data-id="${ledger.id}">切换</button>`}
        ${ledgers.length > 1 && !isCurrent ? 
          `<button class="delete-ledger-btn" data-id="${ledger.id}">删除</button>` : ''}
      </div>
    `;
    
    ledgersList.appendChild(ledgerItem);
  });
  
  // 添加切换账本按钮事件监听
  document.querySelectorAll('.switch-ledger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ledgerId = parseInt(e.currentTarget.dataset.id);
      switchToLedger(ledgerId);
    });
  });
  
  // 添加删除账本按钮事件监听
  document.querySelectorAll('.delete-ledger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ledgerId = parseInt(e.currentTarget.dataset.id);
      deleteLedger(ledgerId);
    });
  });
}

// 删除账本
function deleteLedger(ledgerId) {
  if (!confirm('确定要删除这个账本吗？删除后账本中的所有记录将被清空且无法恢复！')) {
    return;
  }
  
  // 从账本列表中移除
  ledgers = ledgers.filter(ledger => ledger.id !== ledgerId);
  
  // 删除对应账本的记录
  const ledgerKey = `financeRecords_${ledgerId}`;
  localStorage.removeItem(ledgerKey);
  
  // 保存更新后的账本列表
  saveLedgers();
  
  // 如果删除的是当前账本，切换到第一个账本
  if (currentLedgerId === ledgerId && ledgers.length > 0) {
    switchToLedger(ledgers[0].id);
  } else if (ledgers.length === 0) {
    // 如果没有账本了，创建默认账本
    createLedger('默认账本');
  }
  
  // 更新UI
  updateLedgerUI();
  renderLedgersList();
  
  showToast('账本已删除');
}

// 格式化账本创建日期
function formatLedgerDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 更新设置页面UI
function updateSettingsUI() {
  // 更新主题色选择
  customColorInput.value = settings.themeColor;
  colorOptions.forEach(option => {
    option.classList.toggle('selected', option.style.backgroundColor === settings.themeColor);
  });
  
  // 更新背景设置
  bgTypeSelect.value = settings.bgType;
  bgColorInput.value = settings.bgColor;
  bgColorGroup.style.display = settings.bgType === 'solid' ? 'block' : 'none';
  bgImageGroup.style.display = settings.bgType === 'image' ? 'block' : 'none';
  
  // 更新按钮样式选择
  buttonStyleRadios.forEach(radio => {
    radio.checked = radio.value === settings.buttonStyle;
  });
}

// 应用主题色
function applyTheme() {
  document.documentElement.style.setProperty('--primary-color', settings.themeColor);
  // 从主题色生成辅助色
  const primaryColor = settings.themeColor;
  const lighterColor = lightenColor(primaryColor, 15);
  const darkerColor = darkenColor(primaryColor, 15);
  document.documentElement.style.setProperty('--primary-light', lighterColor);
  document.documentElement.style.setProperty('--primary-dark', darkerColor);
}

// 应用背景设置
function applyBackgroundSettings() {
  const body = document.body;
  body.style.background = '';
  body.style.backgroundColor = '';
  body.style.backgroundImage = '';
  body.style.backgroundSize = '';
  body.style.backgroundPosition = '';
  body.style.backgroundRepeat = '';
  
  // 重置所有卡片的背景为半透明
  const cardElements = document.querySelectorAll('.input-section, .calendar-section, .summary-card, .records-section, .settings-section, .filter-section');
  cardElements.forEach(el => {
    el.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  });
  
  if (settings.bgType === 'color') {
    body.style.backgroundColor = settings.bgColor;
    // 更新CSS变量以便在其他地方使用
    document.documentElement.style.setProperty('--bg-color', settings.bgColor);
  } else if (settings.bgType === 'image' && settings.bgImage) {
    try {
      // 检查是否为有效的DataURL
      if (isValidDataURL(settings.bgImage)) {
        body.style.backgroundImage = `url(${settings.bgImage})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'fixed'; // 固定背景图片位置
        // 当有背景图片时，让卡片背景更透明一点
        cardElements.forEach(el => {
          el.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        });
      }
    } catch (e) {
      console.error('Invalid background image:', e);
    }
  }
}

// 应用按钮样式
function applyButtonStyle() {
  // 先移除所有按钮样式类
  document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
    btn.classList.remove('btn-rounded', 'btn-shadow', 'btn-flat');
  });
  
  // 根据设置添加相应的按钮样式类
  if (settings.buttonStyle === 'rounded') {
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
      btn.classList.add('btn-rounded');
    });
  } else if (settings.buttonStyle === 'shadow') {
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
      btn.classList.add('btn-shadow');
    });
  } else if (settings.buttonStyle === 'flat') {
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
      btn.classList.add('btn-flat');
    });
  }
}

// 重置设置
function resetSettings() {
  settings.themeColor = '#16a34a';
  settings.buttonStyle = 'default';
  settings.bgType = 'color';
  settings.bgColor = '#f8fafc';
  settings.bgImage = '';
  
  saveSettings();
  applyTheme();
  applyButtonStyle();
  applyBackgroundSettings();
  updateSettingsUI();
}

// 工具函数：颜色变亮
function lightenColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  
  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);
  
  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;
  
  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);
  
  return "#" + 
    (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// 工具函数：颜色变暗
function darkenColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  
  R = Math.floor(R * (100 - percent) / 100);
  G = Math.floor(G * (100 - percent) / 100);
  B = Math.floor(B * (100 - percent) / 100);
  
  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;
  
  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);
  
  return "#" + 
    (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// 检查是否为有效的DataURL
function isValidDataURL(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'data:';
  } catch (e) {
    // 尝试直接检查DataURL格式
    return str.startsWith('data:') && str.includes(';base64,');
  }
}

// 初始化应用
function initApp() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // 加载用户设置
    loadSettings();
    
    // 加载账本数据
    loadLedgers();
    
    // 加载记录数据（兼容旧版本数据）
    loadRecords(); // 加载旧版本数据并导入到默认账本
    
    // 确保有当前选中的账本
    if (!currentLedgerId && ledgers.length > 0) {
        currentLedgerId = ledgers[0].id;
    }
    
    // 加载当前账本的记录
    loadCurrentLedgerRecords();
    
    // 更新统计信息
    updateSummary();
    
    // 初始化分类选择器
    initCategories();
    
    // 初始化筛选器
    updateFilterMainCategories('all');
    
    // 渲染记录列表
    renderRecords();
    
    // 初始化日历
    initCalendar();
    
    // 添加事件监听器
    addEventListeners();
    
    // 检查离线状态
    checkOfflineStatus();
    
    // 更新账本UI
    updateLedgerUI();
}

// 加载记录数据（兼容旧版本数据）
function loadRecords() {
    try {
        // 首先检查是否有旧版本的记录数据
        const oldRecords = localStorage.getItem('financeRecords');
        if (oldRecords && ledgers.length > 0) {
            // 如果有旧数据，且已经有账本，将旧数据导入到默认账本
            const defaultLedger = ledgers[0];
            const ledgerKey = `financeRecords_${defaultLedger.id}`;
            
            // 只有当默认账本还没有数据时才导入
            if (!localStorage.getItem(ledgerKey)) {
                localStorage.setItem(ledgerKey, oldRecords);
                // 删除旧数据，避免重复导入
                localStorage.removeItem('financeRecords');
            }
        }
    } catch (error) {
        console.error('加载旧记录数据失败:', error);
    }
}

// 加载当前账本的记录
function loadCurrentLedgerRecords() {
    try {
        if (!currentLedgerId) {
            records = [];
            return;
        }
        
        const ledgerKey = `financeRecords_${currentLedgerId}`;
        const storedRecords = localStorage.getItem(ledgerKey);
        if (storedRecords) {
            records = JSON.parse(storedRecords);
        } else {
            records = [];
        }
    } catch (error) {
        console.error('加载当前账本记录失败:', error);
        records = [];
    }
}

// 保存记录数据（基于当前账本）
function saveRecords() {
    try {
        if (!currentLedgerId) {
            return;
        }
        
        const ledgerKey = `financeRecords_${currentLedgerId}`;
        localStorage.setItem(ledgerKey, JSON.stringify(records));
    } catch (error) {
        console.error('保存记录失败:', error);
    }
}

// 添加事件监听器
function addEventListeners() {
    // 标签页切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });
    
    // 切换收支类型
    expenseBtn.addEventListener('click', () => {
        setCurrentType('expense');
    });
    
    incomeBtn.addEventListener('click', () => {
        setCurrentType('income');
    });
    
    // 一级分类变化时更新二级分类
    mainCategorySelect.addEventListener('change', updateSubCategories);
    
    // 添加记录
    addRecordBtn.addEventListener('click', addRecord);
    
    // 监听表单输入，启用/禁用添加按钮
    amountInput.addEventListener('input', validateForm);
    
    // 监听离线/在线状态变化
    window.addEventListener('offline', checkOfflineStatus);
    window.addEventListener('online', checkOfflineStatus);
    
    // 日历导航按钮
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    // 添加图片按钮
    addImageBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.onchange = handleImageSelection;
        fileInput.click();
    });
    
    // 筛选器事件监听器
    filterTypeSelect.addEventListener('change', () => {
        updateFilterMainCategories(filterTypeSelect.value);
        renderRecords();
    });
    
    filterMainCategorySelect.addEventListener('change', () => {
        updateFilterSubCategories(filterTypeSelect.value, filterMainCategorySelect.value);
        renderRecords();
    });
    
    filterSubCategorySelect.addEventListener('change', renderRecords);
    
    clearFilterBtn.addEventListener('click', () => {
        filterTypeSelect.value = 'all';
        updateFilterMainCategories('all');
        renderRecords();
    });
    
    // 设置相关事件
    // 预设颜色选择
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            settings.themeColor = option.style.backgroundColor;
            saveSettings();
            applyTheme();
            updateSettingsUI();
        });
    });
    
    // 自定义颜色输入
    customColorInput.addEventListener('input', () => {
        settings.themeColor = customColorInput.value;
        saveSettings();
        applyTheme();
        updateSettingsUI();
    });
    
    // 背景类型选择
    bgTypeSelect.addEventListener('change', () => {
        settings.bgType = bgTypeSelect.value;
        bgColorGroup.style.display = settings.bgType === 'color' ? 'block' : 'none';
        bgImageGroup.style.display = settings.bgType === 'image' ? 'block' : 'none';
        saveSettings();
        applyBackgroundSettings();
    });
    
    // 背景颜色选择
    bgColorInput.addEventListener('input', () => {
        settings.bgColor = bgColorInput.value;
        saveSettings();
        applyBackgroundSettings();
    });
    
    // 背景图片上传
    bgImageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                settings.bgImage = event.target.result;
                saveSettings();
                applyBackgroundSettings();
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 移除背景图片
    removeBgImageBtn.addEventListener('click', () => {
        settings.bgImage = '';
        saveSettings();
        applyBackgroundSettings();
    });
    
    // 按钮样式选择
    buttonStyleRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            settings.buttonStyle = radio.value;
            saveSettings();
            applyButtonStyle();
        });
    });
    
    // 重置设置
    resetSettingsBtn.addEventListener('click', () => {
        if (confirm('确定要重置所有设置吗？')) {
            resetSettings();
        }
    });
    
    // 账本管理事件监听
    // 账本选择器变化
    const ledgerSelect = document.getElementById('ledger-select');
    if (ledgerSelect) {
        ledgerSelect.addEventListener('change', (e) => {
            switchToLedger(parseInt(e.target.value));
        });
    }
    
    // 添加账本按钮
    const addLedgerBtn = document.getElementById('add-ledger-btn');
    if (addLedgerBtn) {
        addLedgerBtn.addEventListener('click', () => {
            const settingsTab = document.querySelector('[data-tab="settings"]');
            if (settingsTab) {
                settingsTab.click(); // 切换到设置标签页
                setTimeout(() => {
                    const newLedgerInput = document.getElementById('new-ledger-name');
                    if (newLedgerInput) {
                        newLedgerInput.focus(); // 聚焦到新建账本输入框
                    }
                }, 100);
            }
        });
    }
    
    // 创建账本按钮
    const createLedgerBtn = document.getElementById('create-ledger-btn');
    if (createLedgerBtn) {
        createLedgerBtn.addEventListener('click', createNewLedger);
    }
    
    // 新建账本输入框回车事件
    const newLedgerNameInput = document.getElementById('new-ledger-name');
    if (newLedgerNameInput) {
        newLedgerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                createNewLedger();
            }
        });
    }
}

// 切换标签页
function switchTab(tabName) {
    // 更新标签按钮状态
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    
    // 更新标签内容显示
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // 如果切换到日历标签，重新渲染日历
    if (tabName === 'calendar') {
        renderCalendar();
    }
    
    // 如果切换到记录标签，重新渲染记录列表
    if (tabName === 'records') {
        renderRecords();
    }
    
    // 如果切换到设置标签，渲染账本列表
    if (tabName === 'settings') {
        renderLedgersList();
    }
}

// 初始化分类选择器
function initCategories() {
    // 清空一级分类
    mainCategorySelect.innerHTML = '';
    
    // 根据当前类型填充一级分类
    Object.keys(categories[currentType]).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        mainCategorySelect.appendChild(option);
    });
    
    // 初始化二级分类
    updateSubCategories();
}

// 更新二级分类
function updateSubCategories() {
    // 清空二级分类
    subCategorySelect.innerHTML = '';
    
    const mainCategory = mainCategorySelect.value;
    if (mainCategory && categories[currentType][mainCategory]) {
        // 添加空选项
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '请选择二级分类（可选）';
        subCategorySelect.appendChild(emptyOption);
        
        // 添加二级分类
        categories[currentType][mainCategory].forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory;
            option.textContent = subCategory;
            subCategorySelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '请先选择一级分类';
        subCategorySelect.appendChild(option);
    }
}

// 设置当前收支类型
function setCurrentType(type) {
    currentType = type;
    
    if (type === 'expense') {
        expenseBtn.classList.add('active');
        incomeBtn.classList.remove('active');
    } else {
        incomeBtn.classList.add('active');
        expenseBtn.classList.remove('active');
    }
    
    // 更新分类选择器
    initCategories();
}

// 验证表单
function validateForm() {
    const amount = parseFloat(amountInput.value);
    addRecordBtn.disabled = isNaN(amount) || amount <= 0;
}

// 处理图片选择
function handleImageSelection(event) {
    const files = event.target.files;
    
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                continue;
            }
            
            // 读取图片并显示预览
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImages.push(e.target.result);
                updateImagePreview();
            };
            reader.readAsDataURL(file);
        }
    }
}

// 更新图片预览
function updateImagePreview() {
    imagePreview.innerHTML = '';
    
    selectedImages.forEach((image, index) => {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-image';
        
        const img = document.createElement('img');
        img.src = image;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedImages.splice(index, 1);
            updateImagePreview();
        };
        
        previewContainer.appendChild(img);
        previewContainer.appendChild(removeBtn);
        imagePreview.appendChild(previewContainer);
    });
}

// 添加记录
function addRecord() {
    const amount = parseFloat(amountInput.value);
    const mainCategory = mainCategorySelect.value;
    const subCategory = subCategorySelect.value || '';
    const date = dateInput.value;
    const description = descriptionTextarea.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效的金额');
        return;
    }
    
    const newRecord = {
        id: Date.now(), // 使用时间戳作为唯一ID
        amount: amount,
        mainCategory: mainCategory,
        subCategory: subCategory,
        date: date,
        description: description,
        images: [...selectedImages],
        type: currentType,
        createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    saveRecords();
    updateSummary();
    renderRecords();
    
    // 如果当前在日历标签页，重新渲染日历
    if (document.getElementById('calendar-tab').classList.contains('active')) {
        renderCalendar();
    }
    
    // 清空表单
    amountInput.value = '';
    descriptionTextarea.value = '';
    selectedImages = [];
    updateImagePreview();
    validateForm();
    
    // 显示成功提示
    showToast('记录添加成功！');
}

// 删除记录
function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        records = records.filter(record => record.id !== id);
        saveRecords();
        updateSummary();
        renderRecords();
        
        // 如果当前在日历标签页，重新渲染日历
        if (document.getElementById('calendar-tab').classList.contains('active')) {
            renderCalendar();
            // 如果有选中的日期，更新该日期的记录显示
            if (selectedDay) {
                showDayRecords(selectedDay);
            }
        }
        
        showToast('记录已删除！');
    }
}

// 更新统计信息
function updateSummary() {
    const totalIncome = records
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0);
    
    const totalExpense = records
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    totalIncomeEl.textContent = `¥${totalIncome.toFixed(2)}`;
    totalExpenseEl.textContent = `¥${totalExpense.toFixed(2)}`;
    balanceEl.textContent = `¥${balance.toFixed(2)}`;
}

// 更新筛选器一级分类选项
function updateFilterMainCategories(type) {
    filterMainCategorySelect.innerHTML = '<option value="all">全部</option>';
    
    if (type === 'all') {
        // 显示所有一级分类
        const allMainCategories = new Set();
        Object.keys(categories.expense).forEach(cat => allMainCategories.add(cat));
        Object.keys(categories.income).forEach(cat => allMainCategories.add(cat));
        
        allMainCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterMainCategorySelect.appendChild(option);
        });
    } else {
        // 显示指定类型的一级分类
        Object.keys(categories[type]).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterMainCategorySelect.appendChild(option);
        });
    }
    
    // 重置二级分类
    updateFilterSubCategories(type, 'all');
}

// 更新筛选器二级分类选项
function updateFilterSubCategories(type, mainCategory) {
    filterSubCategorySelect.innerHTML = '<option value="all">全部</option>';
    
    if (type === 'all' || mainCategory === 'all') {
        // 不显示具体二级分类选项
        return;
    }
    
    // 显示指定一级分类下的二级分类
    if (categories[type] && categories[type][mainCategory]) {
        categories[type][mainCategory].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterSubCategorySelect.appendChild(option);
        });
    }
}

// 应用筛选条件获取记录
function getFilteredRecords() {
    const filterType = filterTypeSelect.value;
    const filterMainCategory = filterMainCategorySelect.value;
    const filterSubCategory = filterSubCategorySelect.value;
    
    return records.filter(record => {
        // 类型筛选
        if (filterType !== 'all' && record.type !== filterType) {
            return false;
        }
        
        // 一级分类筛选
        if (filterMainCategory !== 'all' && record.mainCategory !== filterMainCategory) {
            return false;
        }
        
        // 二级分类筛选
        if (filterSubCategory !== 'all' && record.subCategory !== filterSubCategory) {
            return false;
        }
        
        return true;
    });
}

// 渲染记录列表
function renderRecords() {
    // 应用筛选
    const filteredRecords = getFilteredRecords();
    
    // 按日期降序排序
    const sortedRecords = [...filteredRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedRecords.length === 0) {
        recordsList.innerHTML = `
            <div class="empty-state">
                <p>暂无记录</p>
                <p>开始添加您的第一条收支记录吧！</p>
            </div>
        `;
        return;
    }
    
    recordsList.innerHTML = '';
    
    sortedRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        // 格式化日期
        const formattedDate = formatDate(record.date);
        
        // 构建分类显示
        const categoryDisplay = record.subCategory ? 
            `${record.mainCategory}-${record.subCategory}` : record.mainCategory;
        
        // 构建记录内容
        let recordContent = `
            <div class="record-info">
                <div class="record-category">${categoryDisplay}</div>
                ${record.description ? `<div class="record-description">${record.description}</div>` : ''}
                <div class="record-date">${formattedDate}</div>
            </div>
            <div class="record-amount ${record.type}">¥${record.amount.toFixed(2)}</div>
            <button class="delete-btn" data-id="${record.id}">×</button>
        `;
        
        // 如果有图片，添加图片预览
        if (record.images && record.images.length > 0) {
            let imagesHtml = '<div class="record-images">';
            record.images.forEach(img => {
                imagesHtml += `<img src="${img}" alt="记录图片" class="record-image">`;
            });
            imagesHtml += '</div>';
            recordContent = recordContent.replace('</div>', `${imagesHtml}</div>`);
        }
        
        recordItem.innerHTML = recordContent;
        recordsList.appendChild(recordItem);
    });
    
    // 添加删除按钮事件监听器
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            deleteRecord(id);
        });
    });
    
    // 添加记录图片点击事件
    document.querySelectorAll('.record-image').forEach(img => {
        img.addEventListener('click', (e) => {
            // 创建图片预览弹窗
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`<img src="${e.currentTarget.src}" style="max-width: 100%; max-height: 100vh;">`);
            previewWindow.document.close();
        });
    });
}

// 初始化日历
function initCalendar() {
    // 设置当前月份显示
    updateCurrentMonthDisplay();
    
    // 渲染日历
    renderCalendar();
}

// 更新当前月份显示
function updateCurrentMonthDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    currentMonthEl.textContent = `${year}年${month}月`;
}

// 渲染日历
function renderCalendar() {
    // 更新当前月份显示
    updateCurrentMonthDisplay();
    
    // 清空日历天数
    calendarDays.innerHTML = '';
    
    // 获取当前月份的第一天
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // 获取当前月份的最后一天
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // 获取当前月份第一天是星期几
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取当前月份的天数
    const daysInMonth = lastDay.getDate();
    
    // 获取上个月的最后几天
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    // 计算需要显示的总天数
    const totalDays = firstDayOfWeek + daysInMonth;
    
    // 生成日历天数
    for (let i = 0; i < totalDays; i++) {
        const dayElement = document.createElement('div');
        let day;
        let isCurrentMonth = true;
        
        if (i < firstDayOfWeek) {
            // 上个月的天数
            day = prevMonthLastDay - (firstDayOfWeek - i - 1);
            isCurrentMonth = false;
            dayElement.classList.add('other-month');
        } else {
            // 当前月的天数
            day = i - firstDayOfWeek + 1;
            dayElement.classList.add('current-month');
        }
        
        // 设置日期文本
        dayElement.textContent = day;
        
        // 设置日期属性
        const dateStr = isCurrentMonth ? 
            `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : 
            (currentDate.getMonth() === 0 ? 
                `${currentDate.getFullYear() - 1}-12-${String(day).padStart(2, '0')}` : 
                `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        
        dayElement.setAttribute('data-date', dateStr);
        
        // 标记今天
        const today = new Date().toISOString().split('T')[0];
        if (dateStr === today) {
            dayElement.classList.add('today');
        }
        
        // 标记选中的日期
        if (selectedDay && dateStr === selectedDay) {
            dayElement.classList.add('selected');
        }
        
        // 添加日期点击事件
        dayElement.addEventListener('click', () => {
            selectDay(dateStr);
        });
        
        // 添加日期样式
        dayElement.classList.add('calendar-day');
        
        // 获取当天的收支情况
        const dayRecords = records.filter(record => record.date === dateStr);
        const dayIncome = dayRecords
            .filter(record => record.type === 'income')
            .reduce((sum, record) => sum + record.amount, 0);
        const dayExpense = dayRecords
            .filter(record => record.type === 'expense')
            .reduce((sum, record) => sum + record.amount, 0);
        
        // 添加金额指示器
        if (dayIncome > 0) {
            const incomeIndicator = document.createElement('div');
            incomeIndicator.className = 'amount-indicator income-indicator';
            incomeIndicator.textContent = `+¥${dayIncome.toFixed(0)}`;
            dayElement.appendChild(incomeIndicator);
        }
        
        if (dayExpense > 0) {
            const expenseIndicator = document.createElement('div');
            expenseIndicator.className = 'amount-indicator expense-indicator';
            expenseIndicator.textContent = `-¥${dayExpense.toFixed(0)}`;
            dayElement.appendChild(expenseIndicator);
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// 选择日期
function selectDay(dateStr) {
    // 移除之前选中的日期样式
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // 添加当前选中的日期样式
    const selectedDayElement = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
    if (selectedDayElement) {
        selectedDayElement.classList.add('selected');
    }
    
    // 更新选中的日期
    selectedDay = dateStr;
    
    // 显示当天的记录
    showDayRecords(dateStr);
}

// 显示当天的记录
function showDayRecords(dateStr) {
    const dayRecords = records.filter(record => record.date === dateStr);
    
    if (dayRecords.length === 0) {
        selectedDayRecords.innerHTML = `
            <div class="empty-state">
                <p>当天暂无记录</p>
            </div>
        `;
        return;
    }
    
    // 按时间排序
    const sortedRecords = [...dayRecords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    selectedDayRecords.innerHTML = '';
    
    sortedRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        // 构建分类显示
        const categoryDisplay = record.subCategory ? 
            `${record.mainCategory}-${record.subCategory}` : record.mainCategory;
        
        // 构建记录内容
        let recordContent = `
            <div class="record-info">
                <div class="record-category">${categoryDisplay}</div>
                ${record.description ? `<div class="record-description">${record.description}</div>` : ''}
            </div>
            <div class="record-amount ${record.type}">¥${record.amount.toFixed(2)}</div>
            <button class="delete-btn" data-id="${record.id}">×</button>
        `;
        
        // 如果有图片，添加图片预览
        if (record.images && record.images.length > 0) {
            let imagesHtml = '<div class="record-images">';
            record.images.forEach(img => {
                imagesHtml += `<img src="${img}" alt="记录图片" class="record-image">`;
            });
            imagesHtml += '</div>';
            recordContent = recordContent.replace('</div>', `${imagesHtml}</div>`);
        }
        
        recordItem.innerHTML = recordContent;
        selectedDayRecords.appendChild(recordItem);
    });
    
    // 添加删除按钮事件监听器
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            deleteRecord(id);
        });
    });
    
    // 添加记录图片点击事件
    document.querySelectorAll('.record-image').forEach(img => {
        img.addEventListener('click', (e) => {
            // 创建图片预览弹窗
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`<img src="${e.currentTarget.src}" style="max-width: 100%; max-height: 100vh;">`);
            previewWindow.document.close();
        });
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 显示提示消息
function showToast(message) {
    // 检查是否已存在toast元素
    let toast = document.querySelector('.toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
        
        // 添加toast样式
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .toast.show {
                opacity: 1;
            }
            
            .record-images {
                margin-top: 5px;
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
            }
            
            .record-image {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 检查离线状态
function checkOfflineStatus() {
    if (!navigator.onLine) {
        showToast('当前处于离线状态，数据将仅保存在本地');
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 导出一些函数以便调试（可选）
if (typeof window !== 'undefined') {
    window.app = {
        loadRecords,
        saveRecords,
        addRecord,
        deleteRecord,
        updateSummary,
        renderRecords,
        renderCalendar
    };
}