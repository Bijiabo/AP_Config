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
            console.error('Can not find element #'+elementID);
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
    var selectedSSIDItem = document.querySelector('input[name="ssid_list"]:checked');
    if (!selectedSSIDItem) {
        console.error('Can not find selected SSID Item');
    }
    var selectedSSIDItemValue = selectedSSIDItem.value;
    var ssid = window.ssid_scan_list[selectedSSIDItemValue].ssid

    var password = document.getElementById('ssid-password').value;

    console.log('Selected SSID Value is:' + ssid, 'password is: '+ password);

    API.connectWiFi(ssid, password, function(res){
        if (res.success) {
            alert ('Connect Wi-Fi success!');
        } else {
            alert ('Connect Wi-Fi failed, please try again.');
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
        window.location.href = '/wifi_config.html';
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

window.onload = function() {
    document.body.classList.add('load');
}