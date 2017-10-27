var cache = {
    hasBeenGetSSIDScanList: false
};

var generate = {
    consoleInfoFromHTML: function(formData) {
        var result = '';
        for (var i=0,len=formData.length; i<len; i++) {
            var item = formData[i];
            
            var itemHTMLCode = '\
            <label class="form_item_title">'+item.key+'</label>\
            <div class="pure-u-1 edit-input-container">\
                <input class="pure-input-1" type="text" placeholder="" value="'+item.value+'">\
            </div>';

            if (!item.enable) {
                itemHTMLCode = '\
                <label class="form_item_title">'+item.key+'</label>\
                <div class="pure-u-1 form_item_disable_edit">\
                    <div class="pure-input-1">'+item.value+'</div>\
                </div>'
            }

            result += itemHTMLCode;
        }
        return result;
    },
    SSIDListFromHTML: function(SSIDList) {
        var result = '';
        for (var i=0,len=SSIDList.length; i<len; i++) {
            var item = SSIDList[i];
            
            var itemHTMLCode = '\
            <label class="m-check ui-margin">\
                <input type="radio" name="ssid_list" value="'+i+'" '+ (i==0?'checked':'') +'>\
                <div class="m-radio ui-pos"></div>\
                <div class="ssid_list_name">'+item.ssid+'</div>\
                <div class="ssid_list_strength">'+item.strength+'%</div>\
            </label>';

            result += itemHTMLCode;
        }
        return result;
    },
    SavedSSIDListFromHTML: function(SSIDList) {
        var result = '';
        for (var i=0,len=SSIDList.length; i<len; i++) {
            var item = SSIDList[i];
            var itemID = 'saved-ssid-item-container-'+i;
            var itemHTMLCode = '\
            <label class="m-check ui-margin" id="'+itemID+'">\
                <div class="ssid_list_name" style="margin-left: 0;">'+item.ssid+'</div>\
                <div class="ssid_list_delete" style="float: right; text-align: right;" onclick="removeSSID(\''+item.ssid+','+itemID+'\');">\
                <img src="assets/delete.jpg">\
                </div>\
            </label>';

            result += itemHTMLCode;
        }
        return result;
    }
};

var render = {
    setHTMLForElementID: function(elementID, HTMLCode) {
        var containerElement = document.getElementById(elementID);
        if (containerElement) {
            containerElement.innerHTML = HTMLCode;
        } else {
            console.warn('Can not find element #'+elementID);
        }   
    },
    consoleInfoFormByFormData: function(formData) {
        var formHTMLCode = generate.consoleInfoFromHTML(formData);
        var formItemContainerId = 'form-items-container';
        this.setHTMLForElementID(formItemContainerId, formHTMLCode);
    },
    SSIDListFromBySSIDList: function(SSIDList) {
        var formHTMLCode = generate.SSIDListFromHTML(SSIDList);
        this.setHTMLForElementID('ssid-list-container', formHTMLCode);
    },
    SavedSSIDListFromBySSIDList: function(SSIDList) {
        var formHTMLCode = generate.SavedSSIDListFromHTML(SSIDList);
        this.setHTMLForElementID('saved-network-list-container', formHTMLCode);
    }
}

var refreshSSIDListData = {
    setIntervalID: -1,
    start: function() {
        var self = this;
        this.end();

        var getDataFunction = function() {
            API.getWiFiScanList(function(res){
                if (!res.success) {
                    alert('Get Wi-Fi scan list failed. Please try refresh page again.');
                    return;
                }
                window.ssid_scan_list = res.data;
                render.SSIDListFromBySSIDList(res.data);
                self.end();
            });
        };
        this.setIntervalID = window.setInterval(getDataFunction, 1000 * 5);
    },
    end: function() {
        if (this.setIntervalID <= 0) {return;}
        window.clearInterval(this.setIntervalID);
        this.setIntervalID = -1;
    }
}

var selectedSSID = function(e) {
    e.preventDefault();
    var selectedSSIDItem = document.querySelector('input[name="ssid_list"]:checked');
    if (!selectedSSIDItem) {
        console.error('Can not find selected SSID Item');
    }
    var selectedSSIDItemValue = selectedSSIDItem.value;
    console.log('Selected SSID Value is:' + selectedSSIDItemValue);
    enterCodeContainerElements.show();
}

var enterCodeContainerElements = {
    getElement: function() {
        var enterCodeContainerElements = document.getElementsByClassName('enter-code-container');
        if (enterCodeContainerElements.length > 0) {
            return enterCodeContainerElements[0];
        } else {
            console.error('Can not find enter-code-container');
            return false;
        }
    },
    show: function() {
        var element = this.getElement();
        if (element) {
            element.style.display = 'block';
        }
    },
    hide: function() {
        var element = this.getElement();
        if (element) {
            element.style.display = 'none';
        }
    }
}

var reloadPage = function() {
    window.location.reload();
}

var connectSSID = function(event) {
    event.preventDefault();

    enterCodeContainerElements.hide();

    var selectedSSIDItem = document.querySelector('input[name="ssid_list"]:checked');
    if (!selectedSSIDItem) {
        console.error('Can not find selected SSID Item');
    }
    var selectedSSIDItemValue = selectedSSIDItem.value;
    var ssid = window.ssid_scan_list[selectedSSIDItemValue].ssid

    var password = document.getElementById('ssid-password').value;

    console.log('Selected SSID Value is:' + ssid, 'password is: '+ password);

    render.setHTMLForElementID('ssid-list-container', '<p style="color: #ff6600;">connecting to ' + ssid + ', please wait.</p>');

    API.connectWiFi(ssid, password, function(res){
        if (res.success) {
            alert ('Connect Wi-Fi success!');
            render.setHTMLForElementID('ssid-list-container', '<p style="color: #2ABB9C;">connect ' + ssid + ' success!</p>');
        } else {
            alert ('Connect Wi-Fi failed, please try again.');
            render.setHTMLForElementID('ssid-list-container', '<p style="color: #E7292E;">connect ' + ssid + ' failed! Reloading Wi-Fi list.</p>');
            refreshSSIDListData.start();
        }
    });
};

var reset = function(event) {
    event.preventDefault();
    API.reset(function(res){
        if (res.success) {
            alert ('Reset success!');
        } else {
            alert ('Reset failed, please try again.');
        }
    });
};

var removeSSID = function(ssid, containerID) {
    API.removeSavedSSID(ssid, function(res){
        if (res.success) {
            alert ('Remove SSID success!');
            var savedSSIDListItemContainer = document.getElementById(containerID);
            if (savedSSIDListItemContainer) {
                savedSSIDListItemContainer.remove();
            }
        } else {
            alert ('Remove SSID failed, please try again.');
            return;
        } 
        window.location.reload();
    });
};

var login = function(event) {
    event.preventDefault();
    var name = document.getElementById('name').value;
    var password = document.getElementById('password').value;
    API.login(name, password, function(res){
        if (res.success) {
            alert ('Log in success!');
        } else {
            alert ('Log in failed, please try again and check your name and password.');
            return;
        } 
        window.location.href = '/manage.html#console_info';
    });
};

var _sideBarMenuDisplay = false;
var toggleSideBarMenu = function() {
    console.log('toggleSideBarMenu');
    var className = 'display-menu';
    if (!_sideBarMenuDisplay) {
        document.body.classList.add(className);
    } else {
        document.body.classList.remove(className);
    }
    _sideBarMenuDisplay = !_sideBarMenuDisplay;
}

// html content
var htmlCode = {
    console_info: '\
    <form class="pure-form pure-form-stacked">\
	    <fieldset>\
		    <h3>Console Info</h3>\
		    <div id="form-items-container"></div>\
	    </fieldset>\
    </form>\
    ',
    factory_reset: '\
    <h3>Factory Reset</h3>\
    <h4>Reset all settings to default values</h4>\
    <div class="button-container">\
        <Button class="button-xlarge pure-button pure-done-button" onclick="reset(event);">Reset Settings</Button>\
    </div>\
    ',
    wifi_config: '\
    <form class="pure-form pure-form-stacked"><fieldset><h3>Wi-Fi Setup</h3><h4>Networks Detected:</h4><label class="m-check ui-margin"><div class="ssid_list_select">Select</div><div class="ssid_list_name" style="width:190px">Name</div><div class="ssid_list_strength">Strength</div></label><div id="ssid-list-container"></div><div class="enter-code-container"><div class="title">Password</div><div class="des">Please enter your network security key.</div><div class="pure-u-1 input-container"><input class="pure-input-1" type="text" placeholder="" value="" id="ssid-password"></div><div class="button-container"><div class="pure-button pure-ghost-button" onclick="enterCodeContainerElements.hide()">Cancel</div><button type="submit" class="pure-button pure-done-button" onclick="connectSSID(event)">OK</button></div></div><div class="button-container"><div class="button-xlarge pure-button pure-done-button" onclick="selectedSSID(event)">Join Network</div></div><div class="refresh-container pure-u-1" onclick="refreshSSIDListData.start()"><div class="pure-u-1"><img src="./assets/refresh.jpg" alt=""></div><div class="pure-u-1"><p>Refresh available networks</p></div></div><h4>Saved Networks:</h4><div id="saved-network-list-container"></div></fieldset></form>\
    ',
    log_in: '\
    <form class="pure-form pure-form-stacked"><fieldset><h3>Please log in:</h3><label for="name">Name</label><div class="pure-u-1"><input id="name" type="text" placeholder="" class="pure-input-1"></div><label for="password">Password</label><div class="pure-u-1"><input id="password" type="password" placeholder="" class="pure-input-1"></div><div class="button-container"><button class="button-xlarge pure-button pure-done-button" style="width:120px;margin-top:20px" onclick="login(event)">OK</button></div></fieldset></form>\
    '
};
var pageSetupCode = {
    console_info: function() {
        refreshSSIDListData.end();
        API.getConsoleInfo(function(res){
            if (!res.success) {
                alert('Get console info failed. Please try refresh page again.');
                return;
            }
            render.consoleInfoFormByFormData(res.data);
        });
    },
    factory_reset: function() {
        refreshSSIDListData.end();
    },
    wifi_config: function() {
        refreshSSIDListData.start();
        
        render.setHTMLForElementID('ssid-list-container', '<p>Loading...</p>');

        API.getWiFiSavedList(function(res){
            if (!res.success) {
                alert('Get Wi-Fi saved list failed. Please try refresh page again.');
                return;
            }
            window.saved_ssid_list = res.data;
            render.SavedSSIDListFromBySSIDList(res.data);
        });
    },
    log_in: function() {}
};

// hash
window.onhashchange = function() {
    var hash = window.location.hash;
    console.log('[onhashchange] ' + hash);
    renderPageContent(hash);
};

var setupHashOnload = function() {
    var hash = window.location.hash;
    renderPageContent(hash);
};

var renderPageContent = function(hash) {
    hash = hash.replace('#', '');

    // 处理 login 页面特殊情况
    if (hash == '') {
        hash = 'log_in'
    }

    var code = htmlCode[hash];
    if (!code) {
        alert('Can not load page content (10001)');
    }

    var container = document.getElementsByClassName('container');
    if (container.length == 0) {
        alert('Can not find container element (10002)');
    }

    container = container[0];
    container.innerHTML = code;

    var setupCode = pageSetupCode[hash];
    if (!setupCode) {
        alert('Can not load page setup code (10003)');
    }

    setupCode();
};

window.onload = function() {
    document.body.classList.add('load');
    setupHashOnload();
}