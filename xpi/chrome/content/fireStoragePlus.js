define(
    [
        'firebug/lib/object',
        'firebug/lib/locale',
        'firebug/lib/trace',
        'firebug/lib/dom',
        "firestorageplus/fireStoragePlusDomplate",
        "firestorageplus/fireStoragePlusClipboard",
        "firestorageplus/fireStoragePlusStorage",
        "firestorageplus/fireStoragePlusEdit",
        "firestorageplus/fireStoragePlusObserver"
    ],
    function(Obj, Locale, FBTrace, Dom, FireStoragePlusDomplate, FireStoragePlusClipboard, FireStoragePlusStorage, FireStoragePlusEdit, FireStoragePlusObserver) {
        var panelName = 'firestorageplus';
        Locale.registerStringBundle("chrome://firestorageplus/locale/firestorageplus.properties");
        var FireStoragePlus = function FireStoragePlus() {
           this.observer = null;
        };

        FireStoragePlus.prototype = Obj.extend(
            Firebug.Panel,
            {
                name: panelName,
                title: 'FireStorage Plus!',

                // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
                // Initialization

                initialize: function() {
                    if (FBTrace.DBG_FIRESTORAGEPLUS) {
                        FBTrace.sysout("firestorageplus; panel init");
                    }
                    Firebug.Panel.initialize.apply(this, arguments);
                },

                destroy: function(state) {
                    Firebug.Panel.destroy.apply(this, arguments);
                },

                show: function(state) {
                    Firebug.Panel.show.apply(this, arguments);
                    FireStoragePlusDomplate.render(this);
                   // var db = FireStoragePlusStorage.getInMemoryDatabaseConnection();
                },
                
                refresh: function() {
                },
                getContextMenuItems: function(storage, target, context) {
                    var items = [];
                    if (Dom.getAncestorByClass(target, "storageHeaderRow")) {
                        return items;
                    }
                    
                    items.push({
                      label: Locale.$STR("firestorageplus.Copy"),
                      command: Obj.bindFixed(this.onCopy, this, storage)
                    });
                    items.push("-");
                    items.push({
                      label: Locale.$STR("firestorageplus.Paste"),
                      //disabled: FireStoragePlusClipboard.isStorageAvailable() ? false : true,
                      command: Obj.bindFixed(this.onPaste, this, storage)
                    });
                    items.push("-");
                    items.push({
                      label: Locale.$STR("firestorageplus.Remove"),
                      command: Obj.bindFixed(this.onRemove, this, target, storage)
                    });
                    items.push("-");
                    items.push({
                      label: Locale.$STR("firestorageplus.Edit"),
                      command: Obj.bindFixed(this.onEdit, this, target, storage)
                    });
                    items.push("-");
                    items.push({
                        label: Locale.$STR("firestorageplus.Create"),
                        command: Obj.bindFixed(this.onCreate, this)
                    });
                    items.push("-");
                    items.push({
                        label: Locale.$STR("firestorageplus.Delete localStorages for current scope"),
                        command: Obj.bindFixed(this.onRemoveLocalStorageForScope, this)
                    });
                    items.push("-");
                    items.push({
                        label: Locale.$STR("firestorageplus.Delete localStorages for all scopes"),
                        command: Obj.bindFixed(this.onRemoveAllLocalStorage, this)
                    });
                    items.push("-");
                    items.push({
                        label: Locale.$STR("firestorageplus.About"),
                        command: Obj.bindFixed(this.onAbout, this)
                    });
                    return items;
                },
                onCopy: function(clickedStorage) {
                    FireStoragePlusClipboard.copyTo(clickedStorage);
                },
                onPaste: function()  {
                    var context = Firebug.currentContext;
                    var values = FireStoragePlusClipboard.getFrom();
                    if (!values || !context)
                        return;
                    var storage = FireStoragePlusStorage.add(values);
                    FireStoragePlusDomplate.insertStorageRow(storage);
                },
                onRemove: function(element, storage) {
                    FireStoragePlusStorage.remove(storage);
                    FireStoragePlusDomplate.removeStorageRow(element);
                },
                onRemoveAllLocalStorage: function(element) {
                    FireStoragePlusStorage.removeAllLocalStorage();
                    this.show();
                },
                onRemoveLocalStorageForScope: function(element) {
                    FireStoragePlusStorage.removeLocalStorageForScope(FireStoragePlusStorage.getCurrentScope());
                    this.show();
                },
                onEdit: function(element, storage) {
                    var params = {
                            storage: storage,
                            action: "edit",
                            window: null,
                            FireStoragePlusEdit: FireStoragePlusEdit,
                            storageRow: element,
                            Firebug: Firebug,
                            FBTrace: FBTrace,
                        };
                    var parent = Firebug.currentContext.chrome.window;
                    return parent.openDialog("chrome://firestorageplus/content/fireStoragePlusEdit.xul",
                        "_blank", "chrome,centerscreen,resizable=yes,modal=yes",
                        params);
                },
                onCreate: function() {
                    var params = {
                            action: "create",
                            window: null,
                            FireStoragePlusEdit: FireStoragePlusEdit,
                            Firebug: Firebug,
                            FBTrace: FBTrace,
                    };
                    var parent = Firebug.currentContext.chrome.window;
                    return parent.openDialog("chrome://firestorageplus/content/fireStoragePlusEdit.xul",
                            "_blank", "chrome,centerscreen,resizable=yes,modal=yes",
                            params);
                },
                onAbout: function() {
                    Components.utils["import"]("resource://gre/modules/AddonManager.jsm");

                    AddonManager.getAddonByID("firestorageplus@nickbelhomme.com", function(addon)
                    {
                        openDialog("chrome://mozapps/content/extensions/about.xul", "",
                        "chrome,centerscreen,modal", addon);
                    });
                }
            }
        );

        Firebug.registerPanel(FireStoragePlus);
        Firebug.registerStylesheet("chrome://firestorageplus/skin/firestorageplus.css");

        return FireStoragePlus;
    }
);