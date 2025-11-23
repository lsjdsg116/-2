// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('智慧农业平台启动中...');

    // 初始化图表
    initCharts();
// 配置你的后端API地址（替换为你的ECS公网IP）
const API_BASE_URL = 'http://120.26.138.224:5000'; // ⚠️ 替换为你的真实IP

// 获取土壤湿度数据
async function getSoilData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/soil_data`);
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ 获取土壤数据:', data.soil_moisture + '%');
            return {
                soil_moisture: data.soil_moisture,
                timestamp: data.timestamp,
                is_real_data: true
            };
        } else {
            throw new Error(data.error || '未知错误');
        }
    } catch (error) {
        console.log('❌ 使用模拟数据（原因:', error.message + ')');
        return generateMockData();
    }
}

// 更新启动函数
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    
    // 立即获取数据
    updateSoilData();
    
    // 每30秒更新一次
    setInterval(updateSoilData, 30000);
});

// 更新数据函数
async function updateSoilData() {
    const soilData = await getSoilData();
    
    // 更新湿度仪表盘
    if (window.humidityChart) {
        humidityChart.setOption({
            series: [{
                data: [{ 
                    value: parseFloat(soilData.soil_moisture), 
                    name: '土壤湿度' 
                }]
            }]
        });
    }
    
    // 更新告警
    updateAlerts(soilData);
}

// 更新告警显示
function updateAlerts(data) {
    const alertList = document.getElementById('alertList');
    if (!alertList) return;
    
    alertList.innerHTML = '';
    
    const moisture = parseFloat(data.soil_moisture);
    const time = new Date().toLocaleTimeString();
    
    if (moisture > 70) {
        addAlert(`💦 过湿: ${moisture}%`, 'high', time);
    } else if (moisture < 40) {
        addAlert(`💧 过干: ${moisture}%`, 'low', time);
    } else {
        addAlert(`✅ 正常: ${moisture}%`, 'normal', time);
    }
    
    addAlert(`🕒 更新时间: ${time}`, 'info', time);
}

function addAlert(message, type, time) {
    const alertList = document.getElementById('alertList');
    const li = document.createElement('li');
    li.innerHTML = `${time} - ${message}`;
    alertList.appendChild(li);
}
    // 初始化温度图表
    window.temperatureChart = echarts.init(tempEl);
    const temperatureOption = {
        title: { text: '24小时温度趋势', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: window.timeLabels
        },
        yAxis: {
            type: 'value',
            name: '温度(°C)'
        },
        series: [{
            name: '温度',
            type: 'line',
            data: window.temperatureData,
            smooth: true,
            itemStyle: { color: '#ff6b6b' },
            lineStyle: { color: '#ff6b6b' },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(255, 107, 107, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(255, 107, 107, 0.1)'
                    }]
                }
            }
        }]
    };
    window.temperatureChart.setOption(temperatureOption);

    // 初始化湿度仪表盘（初始值取最近温度数据附近随机值）
    window.humidityChart = echarts.init(humEl);
    const initialHumidity = randomInRange(30, 80);
    const humidityOption = {
        series: [{
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 10,
            itemStyle: { color: '#4ecdc4' },
            progress: { show: true, width: 15 },
            pointer: { show: false },
            axisLine: { lineStyle: { width: 15 } },
            axisTick: { distance: -25, splitNumber: 5, lineStyle: { width: 1, color: '#999' } },
            splitLine: { distance: -30, length: 8, lineStyle: { width: 2, color: '#999' } },
            axisLabel: { distance: -20, color: '#999', fontSize: 12 },
            anchor: { show: false },
            title: { show: false },
            detail: {
                valueAnimation: true,
                fontSize: 30,
                offsetCenter: [0, '20%'],
                formatter: '{value}%',
                color: '#4ecdc4'
            },
            data: [{ value: initialHumidity, name: '土壤湿度' }]
        }]
    };
    window.humidityChart.setOption(humidityOption);
}

// 生成时间标签
function generateTimeLabels() {
    const labels = [];
    for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return labels;
}

// 生成模拟数据（返回数值）
function generateMockData() {
    return {
        temperature: randomInRange(15, 35), // 15-35度
        humidity: randomInRange(30, 80),    // 30-80%
        timestamp: new Date()
    };
}

// 工具：生成指定范围随机数（保留一位小数）
function randomInRange(min, max) {
    return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

// 开始数据模拟
let _simInterval = null;
function startDataSimulation() {
    // 立即更新一次
    updateCharts();

    // 清除已有定时器（避免重复）
    if (_simInterval) clearInterval(_simInterval);
    _simInterval = setInterval(updateCharts, 3000);
}

// 更新图表数据
function updateCharts() {
    const data = generateMockData();

    // 更新温度数据数组，保持最多24个点
    if (!window.temperatureData) window.temperatureData = [];
    if (window.temperatureData.length >= 24) {
        window.temperatureData.shift();
    }
    window.temperatureData.push(data.temperature);

    if (window.temperatureChart) {
        window.temperatureChart.setOption({
            series: [{ data: window.temperatureData }],
            xAxis: [{ data: window.timeLabels }]
        });
    }

    // 更新湿度仪表盘
    if (window.humidityChart) {
        window.humidityChart.setOption({
            series: [{
                data: [{ value: data.humidity, name: '土壤湿度' }]
            }]
        });
    }

    // 检查告警
    checkAlerts(data);
}

// 检查告警条件
function checkAlerts(data) {
    const alertList = document.getElementById('alertList');
    if (!alertList) return;

    const temp = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);

    // 清空旧告警（在实际应用中可能需要更复杂的逻辑）
    alertList.innerHTML = '';

    // 温度告警
    if (temp > 30) {
        addAlert(`🔥 高温告警: ${temp}°C`, 'high-temp');
    } else if (temp < 18) {
        addAlert(`❄️ 低温告警: ${temp}°C`, 'low-temp');
    }

    // 湿度告警
    if (humidity < 40) {
        addAlert(`💧 低湿度告警: ${humidity}%`, 'low-humidity');
    } else if (humidity > 75) {
        addAlert(`💦 高湿度告警: ${humidity}%`, 'high-humidity');
    }

    // 如果没有告警，显示正常状态
    if (alertList.children.length === 0) {
        addAlert('✅ 所有参数正常', 'normal');
    }
}

// 添加告警信息
function addAlert(message, type) {
    const alertList = document.getElementById('alertList');
    if (!alertList) return;

    const li = document.createElement('li');
    li.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    li.style.padding = '8px 12px';
    li.style.marginBottom = '6px';
    li.style.borderLeft = '6px solid';
    li.style.borderRadius = '4px';
    li.style.listStyle = 'none';
    li.style.display = 'block';

    // 根据告警类型设置样式
    switch(type) {
        case 'high-temp':
            li.style.background = '#ffebee';
            li.style.borderLeftColor = '#f44336';
            break;
        case 'low-temp':
            li.style.background = '#e3f2fd';
            li.style.borderLeftColor = '#2196f3';
            break;
        case 'high-humidity':
            li.style.background = '#e8f5e8';
            li.style.borderLeftColor = '#4caf50';
            break;
        case 'low-humidity':
            li.style.background = '#fff3e0';
            li.style.borderLeftColor = '#ff9800';
            break;
        default:
            li.style.background = '#f5f5f5';
            li.style.borderLeftColor = '#9e9e9e';
    }

    alertList.appendChild(li);
}

// 窗口调整大小时重置图表尺寸
window.addEventListener('resize', function() {
    if (window.temperatureChart && typeof window.temperatureChart.resize === 'function') {
        window.temperatureChart.resize();
    }
    if (window.humidityChart && typeof window.humidityChart.resize === 'function') {
        window.humidityChart.resize();
    }

});
