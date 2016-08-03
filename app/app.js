/**
 * Created by Simon on 4/28/2016.
 */
(function(){
    var app = angular.module('bestMenuApp', []);

    app.factory('indexedDBDataSvc', function($window, $q){
        console.log('factory loaded....');
        var indexedDB = $window.indexedDB;
        var db=null;
        //var lastIndex=0;

        var open = function(){
            var deferred = $q.defer();
            var version = 2;
            var request = indexedDB.open("menus", version);
            request.onupgradeneeded = function(e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;
                if(!db.objectStoreNames.contains("menus")) {
                    db.createObjectStore("menus", { autoIncrement:true });
                }
            };
            request.onsuccess = function(e) {
                console.log('DB opened....');
                db = e.target.result;
                deferred.resolve();
            };
            request.onerror = function(){
                deferred.reject();
            };

            return deferred.promise;
        };

        var getMenus = function(){
            var deferred = $q.defer();

            var tempMenus =[];
            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var objectStore = db.transaction(["menus"]).objectStore("menus");

                // Get everything in the store;
                objectStore.openCursor().onsuccess = function(e) {
                    var result = e.target.result;
                    if(result)
                    {
                        tempMenus.push(result.value);
                        //console.log(result.value);
                        result.continue();
                    }
                    else{
                        console.log('No more entries...');
                        deferred.resolve(tempMenus);

                    }
                };

                objectStore.openCursor().onerror = function(e){
                    console.log(e.value);
                    deferred.reject("Something went wrong!!!");
                };
            }
            return deferred.promise;
        };

        var addMenu = function(menu){
            var deferred = $q.defer();
            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["menus"], "readwrite");
                var store = trans.objectStore("menus");
                // Adding the menu
                var request = store.put(menu);
                // Add is successful
                request.onsuccess = function(e) {
                    // Setting the id of menu as it is in DB
                    var idToSet = e.target.result;
                    // Getting the object we just added to set the id
                    var request2 = store.get(idToSet);
                    request2.onsuccess = function(e) {
                        var menuWithId = e.target.result;
                        menuWithId.id = idToSet;
                        console.log("Setting id...");
                        console.log(idToSet);
                        // Put this updated object back into the database.
                        var requestUpdate = store.put(menuWithId, idToSet);
                        requestUpdate.onerror = function(event) {
                            // Do something with the error
                            console.log("id not set");
                        };
                        requestUpdate.onsuccess = function(event) {
                            // Success - the data is updated!
                            console.log("id set");
                        };
                    };

                    deferred.resolve();
                    console.log("Menu item has been added:");
                };

                // Add is unsuccessful
                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Menu item couldn't be added!");
                };
            }
            return deferred.promise;
        };

        var editMenu = function(menu){
            var deferred = $q.defer();
            var trans = db.transaction(['menus'], 'readwrite');
            var store = trans.objectStore('menus');

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.id === menu.id) {
                        //console.log(cursor.value);
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;
                        console.log("Updating menu...");
                        // update the value(s) in the object that we want to change
                        menuToUpdate.id = menu.id;
                        menuToUpdate.appetizer = menu.appetizer;
                        menuToUpdate.isDrinks = menu.isDrinks;
                        menuToUpdate.drinks = menu.drinks;
                        menuToUpdate.entree = menu.entree;
                        menuToUpdate.isWine = menu.isWine;
                        menuToUpdate.wine = menu.wine;
                        menuToUpdate.dessert = menu.dessert;
                        menuToUpdate.author = menu.author;

                        var requestUpdate = store.put(menuToUpdate, menu.id);
                        requestUpdate.onerror = function(event) {
                            // Do something with the error
                            console.log("Menu not updated !");
                        };
                        requestUpdate.onsuccess = function(event) {
                            // Success - the data is updated!
                            console.log("Menu updated !");
                        };
                    } else {
                        cursor.continue();
                    }
                }

            };
            return deferred.promise;
        };

        var upvote = function(menu){
            var deferred = $q.defer();
            var trans = db.transaction(['menus'], 'readwrite');
            var store = trans.objectStore('menus');

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.id === menu.id) {
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;

                        // update the value(s) in the object that we want to change
                        menuToUpdate.upvotes++;

                        var requestUpdate = store.put(menuToUpdate, menu.id);
                        requestUpdate.onerror = function(e) {
                            console.log(e.value);
                            deferred.reject("Menu couldn't be upvoted!");
                        };
                        requestUpdate.onsuccess = function(e) {
                            // Success - the data is updated!
                            deferred.resolve();
                            console.log("Upvote successful:");
                            console.log(menuToUpdate);
                        };
                    } else {
                        cursor.continue();
                    }
                }

            };
            return deferred.promise;
        };

        var downvote = function(menu){
            var deferred = $q.defer();
            var trans = db.transaction(['menus'], 'readwrite');
            var store = trans.objectStore('menus');

            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.id === menu.id) {
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;

                        // update the value(s) in the object that we want to change
                        menuToUpdate.downvotes++;

                        var requestUpdate = store.put(menuToUpdate, menu.id);
                        requestUpdate.onerror = function(e) {
                            console.log(e.value);
                            deferred.reject("Menu couldn't be downvoted!");
                        };
                        requestUpdate.onsuccess = function(e) {
                            // Success - the data is updated!
                            deferred.resolve();
                            console.log("Downvote successful:");
                            console.log(menuToUpdate);
                        };
                    } else {
                        cursor.continue();
                    }
                }

            };
            return deferred.promise;
        };

        var deleteMenu = function(menu){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["menus"], "readwrite");
                var store = trans.objectStore("menus");

                var request = store.delete(menu.id);
                request.onsuccess = function(e) {
                    deferred.resolve();
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Menu item couldn't be deleted");
                };
            }

            return deferred.promise;
        };

        return{
            open: open,
            getMenus: getMenus,
            addMenu: addMenu,
            editMenu: editMenu,
            deleteMenu: deleteMenu,
            upvote: upvote,
            downvote: downvote

        };
    });

    app.controller('menuController', function($window, indexedDBDataSvc){

        this.edition = false;
        var that = this;
        that.menus = [];
        that.menu = {};

        that.refreshList = function(){
            indexedDBDataSvc.getMenus().then(function(data){
                that.menus=data;
            }, function(err){
                $window.alert(err);
            });
        };

        that.addMenu = function(){
            if(that.menu.entree != null || that.menu.author != null){
                that.menu.upvotes = 0;
                that.menu.downvotes = 0; //Math.floor((Math.random() * 100) + 1);
                indexedDBDataSvc.addMenu(that.menu).then(function(){
                    that.refreshList();
                }, function(err){
                    $window.alert(err);
                });
                that.menu = {};
            }

        };

        that.deleteMenu = function(menu){
            console.log(menu);
            indexedDBDataSvc.deleteMenu(menu).then(function(){
                that.refreshList();
            }, function(err){
                $window.alert(err);
            });
            that.menu = {};
        };

        /* FOR LOCAL AND TEMPORARY USE ONLY
         this.addMenu = function() {
         console.log(this.menu);
         indexedDBDataSvc.addMenu(this.menu);
         this.menus.push(this.menu);
         console.log(this.menus);
         this.menu = {};
         };

         this.deleteMenu = function(menu){
         var index = this.menus.indexOf(menu);
         if (index > -1) {
         this.menus.splice(index, 1);
         }
         };
         this.editMenuView = function(menu){
         this.menu = menu;
         this.edition = true;
         this.currentIndex = this.menus.indexOf(menu);
         };

         this.editMenuSubmit = function(){
         if (this.currentIndex > -1) {
         console.log(this.menu);
         this.menus[this.currentIndex] = this.menu;
         console.log(this.menus);
         }
         this.currentIndex = -1;
         this.menu = {};
         };
         */

        that.editMenuView = function(menu){
            that.menu = menu;
            this.edition = true;
            console.log(that.menu);
        };

        that.editMenu = function(){
            indexedDBDataSvc.editMenu(that.menu).then(function(){
                that.refreshList();
            }, function(err){
                $window.alert(err);
            });
            that.menu = {};

            this.edition = false;
        };

        that.upvote = function(menu){
            indexedDBDataSvc.upvote(menu).then(function(){
                that.refreshList();
            }, function(err){
                $window.alert(err);
            });
        };

        that.downvote = function(menu){
            indexedDBDataSvc.downvote(menu).then(function(){
                that.refreshList();
            }, function(err){
                $window.alert(err);
            });
        };

        function init(){
            indexedDBDataSvc.open().then(function(){
                for(var i = 0; i<3; i++){
                    that.menu = someMenus[i];
                    that.addMenu();
                }
                that.refreshList();
            });

        }

        init();

    });

    var someMenus = [
        {
            appetizer:'Fries',
            isDrinks: true,
            drinks:'Budweiser',
            entree:'Burger',
            isWine: false,
            wine:'',
            dessert:'Ice cream',
            author: 'John Doe'
        },
        {
            appetizer:'',
            isDrinks: false,
            drinks:'',
            entree:'Deep dish pizza',
            isWine: true,
            wine:'Chianti',
            dessert:'Cheesecake',
            author: 'Karl Xarm'
        },
        {
            appetizer: 'Onion rings',
            isDrinks: true,
            drinks:'Miller lite',
            entree:'Pizza',
            isWine: false,
            wine:'',
            dessert:'Cookies',
            author: 'Ben Hur'
        }
    ];
})();
