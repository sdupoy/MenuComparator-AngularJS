/**
 * Created by Simon on 4/28/2016.
 */
(function(){
  var app = angular.module('bestMenuApp', []);

    app.factory('indexedDBDataSvc', function($window, $q){
        console.log('factory loaded....');
        var indexedDB = $window.indexedDB;
        var db=null;
        var lastIndex=0;

        var open = function(){
            var deferred = $q.defer();
            var version = 1;
            var request = indexedDB.open("menus", version);
            request.onupgradeneeded = function(e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;
                if(!db.objectStoreNames.contains("menus")) {
                    db.createObjectStore("menus", { autoIncrement: true });
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
                        tempMenus.push(result.value.menu);
                        console.log(result.value.menu);
                        if(result.value.id > lastIndex){
                            lastIndex=result.value.id;
                        }
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
                lastIndex++;
                menu.id = lastIndex;
                var request = store.put({
                    "id": lastIndex,
                    "menu": menu
                });

                request.onsuccess = function(e) {
                    deferred.resolve();
                    console.log("Menu item has been added!");
                };

                request.onerror = function(e) {
                    console.log(e.value);
                    deferred.reject("Menu item couldn't be added!");
                };
            }
            return deferred.promise;
        };

        var editMenu = function(menu){
            var deferred = $q.defer();
            var transaction = db.transaction(['menus'], 'readwrite');
            var objectStore = transaction.objectStore('menus');

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.menu.id === menu.id) {
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;

                        // update the value(s) in the object that we want to change
                        menuToUpdate.menu.appetizer = menu.appetizer;
                        menuToUpdate.menu.isDrinks = menu.isDrinks;
                        menuToUpdate.menu.drinks = menu.drinks;
                        menuToUpdate.menu.entree = menu.entree;
                        menuToUpdate.menu.isWine = menu.isWine;
                        menuToUpdate.menu.wine = menu.wine;
                        menuToUpdate.menu.dessert = menu.dessert;
                        menuToUpdate.menu.author = menu.author;
                        var request = cursor.update(menuToUpdate);
                        request.onerror = function(e) {
                            console.log(e.value);
                            deferred.reject("Menu item couldn't be updated!");
                        };
                        request.onsuccess = function(e) {
                            // Success - the data is updated!
                            deferred.resolve();
                            console.log("Update successful");
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
            var transaction = db.transaction(['menus'], 'readwrite');
            var objectStore = transaction.objectStore('menus');

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.menu.id === menu.id) {
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;

                        // update the value(s) in the object that we want to change
                        menuToUpdate.menu.upvotes++;
                        var request = cursor.update(menuToUpdate);
                        request.onerror = function(e) {
                            console.log(e.value);
                            deferred.reject("Menu couldn't be upvoted!");
                        };
                        request.onsuccess = function(e) {
                            // Success - the data is updated!
                            deferred.resolve();
                            console.log("Upvote successful");
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
            var transaction = db.transaction(['menus'], 'readwrite');
            var objectStore = transaction.objectStore('menus');

            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    if(cursor.value.menu.id === menu.id) {
                        // Get the old value that we want to update
                        var menuToUpdate = cursor.value;

                        // update the value(s) in the object that we want to change
                        menuToUpdate.menu.downvotes++;
                        var request = cursor.update(menuToUpdate);
                        request.onerror = function(e) {
                            console.log(e.value);
                            deferred.reject("Menu couldn't be downvoted!");
                        };
                        request.onsuccess = function(e) {
                            // Success - the data is updated!
                            deferred.resolve();
                            console.log("Downvote successful");
                        };
                    } else {
                        cursor.continue();
                    }
                }

            };
            return deferred.promise;
        };

        var deleteMenu = function(key){
            var deferred = $q.defer();

            if(db === null){
                deferred.reject("IndexDB is not opened yet!");
            }
            else{
                var trans = db.transaction(["menus"], "readwrite");
                var store = trans.objectStore("menus");

                var request = store.delete(key);
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
            upvote: upvote,
            downvote: downvote,
            deleteMenu: deleteMenu
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
              that.menu.upvotes = Math.floor((Math.random() * 100) + 1);
              that.menu.downvotes = Math.floor((Math.random() * 100) + 1);
              indexedDBDataSvc.addMenu(that.menu).then(function(){
                  that.refreshList();
              }, function(err){
                  $window.alert(err);
              });
              that.menu = {};
          }

      };

      that.deleteMenu = function(id){
          console.log(id);
          indexedDBDataSvc.deleteMenu(id).then(function(){
              that.refreshList();
          }, function(err){
              $window.alert(err);
          });
          that.menu = {};
          that.edition = false; 
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
          that.edition = true;
          console.log(that.menu);
      };

      that.editMenu = function(){
          indexedDBDataSvc.editMenu(that.menu).then(function(){
              that.refreshList();
          }, function(err){
              $window.alert(err);
          });
          that.menu = {};
          that.edition = false;
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
        id: 1,
      appetizer:'Fries',
      isDrinks: true,
      drinks:'Budweiser',
      entree:'Burger',
      isWine: false,
      wine:'',
      dessert:'Ice cream',
      author: 'John Doe',
        upvotes: 81,
        downvotes: 9
    },
    {
        id: 2,
      appetizer:'',
      isDrinks: false,
      drinks:'',
      entree:'Deep dish pizza',
      isWine: true,
      wine:'Chianti',
      dessert:'Cheesecake',
      author: 'Karl Xarm',
        upvotes: 105,
        downvotes: 36
    },
  {
      id: 3,
      appetizer: 'Onion rings',
      isDrinks: true,
      drinks:'Miller lite',
      entree:'Pizza',
      isWine: false,
      wine:'',
      dessert:'Cookies',
      author: 'Ben Hur',
      upvotes: 52,
      downvotes: 48
  }
  ];
})();
