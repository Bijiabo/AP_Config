var API = {
    _debugMode: false,
    _log: function(method, path, data, callback) { console.log('run ['+method+']: ', path, data, callback) },
    _post: function(path, data, callback) {
        this._log('post', path, data, callback);
        ajax().post(path, data).then(callback);
    },
    _get: function(path, callback) {
        this._log('get', path, {}, callback);
        ajax().get(path).then(callback);
    }
};

// get data actions

API.getWiFiScanList = function(callback) {
    if (this._debugMode) {
        callback({
            success: true,
            data: [
                {ssid: 'MXCHIP_PD', strength: '100'},
                {ssid: 'MXCHIP_FAE', strength: '85'},
                {ssid: 'MXCHIP_FHE', strength: '93'},
                {ssid: 'MXCHIP_TE', strength: '60'}
            ]
        });
        return;
    }
    this._get('/api/wifi_scan_list', callback);
};

API.getWiFiSavedList = function(callback) {
    if (this._debugMode) {
        callback({
            success: true,
            data: [
                {ssid: 'MXCHIP_PD_5G'},
                {ssid: 'MXCHIP_Salse'}
            ]
        });
        return;
    }
    this._get('/api/wifi_saved_list', callback);
};

API.getConsoleInfo = function(callback) {
    if (this._debugMode) {
        callback({
            success: true,
            data: [
                {
                    key: 'Device name',
                    value: 'Charlie\'s Bride',
                    enable: false
                },
                {
                    key: 'Device ID',
                    value: 'XXX XXX XXX',
                    enable: false
                },
                {
                    key: 'Family name',
                    value: 'Smith',
                    enable: false
                },
                {
                    key: 'Family ID',
                    value: 'XXX XXX XXX',
                    enable: false
                },
                {
                    key: 'Registration date',
                    value: '12 March 2018',
                    enable: false
                }
            ]
        });
        return;
    }
    this._get('/api/console_info', callback);
};

// post actions

API.login = function(name, password, callback) {
    if (this._debugMode) {
        callback({
            success: true
        });
        return;
    }
    var path = '/api/login';
    var data = {
        name: name,
        password: password
    };
    this._post(path, data, callback);
};

API.connectWiFi = function(ssid, password, callback) {
    if (this._debugMode) {
        callback({
            success: true
        });
        return;
    }
    var data = {ssid: ssid, password: password};
    this._post('/api/connect_wifi', data, callback);
};

API.reset = function(callback) {
    if (this._debugMode) {
        callback({
            success: true
        });
        return;
    }
    this._post('/api/reset', {}, callback);
}

API.removeSavedSSID = function(ssid, callback) {
    if (this._debugMode) {
        callback({
            success: true
        });
        return;
    }
    this._post('/api/remove_saved_ssid', {ssid: ssid}, callback);
}