/**
 * Created by Simon on 4/28/2016.
 */
(function(){
  var app = angular.module('bestMenuApp', ['ngRoute']);

  app.controller('menuController', function(){
      this.menu = {};
      this.menus = someMenus;
      this.edition = false;
      this.currentIndex;


      this.addMenu = function() {
          console.log(this.menu);
          this.menus.push(this.menu);
          this.menu = {};
      }

      this.deleteMenu = function(menu){
          var index = this.menus.indexOf(menu);
          if (index > -1) {
              this.menus.splice(index, 1);
          }
      }

      this.editMenuView = function(menu){
          this.menu = menu;
          this.edition = true;
          this.currentIndex = this.menus.indexOf(menu);
      }

      this.editMenuSubmit = function(){
          if (this.currentIndex > -1) {
              console.log(this.menu);
              this.menus[this.currentIndex] = this.menu;
              console.log(this.menus);
          }
          this.currentIndex = -1;
          this.menu = {};
      }

      });

    var menuInit = {
        id: '',
        appetizer:'',
        isDrinks: false,
        drinks:'',
        entree:'',
        isWine: false,
        wine:'',
        dessert:'',
        rating:0,
        author: '',
        upvotes: 0,
        downvotes: 0
    };

  var someMenus = [
    {
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
      appetizer: 'Onion rings',
      isDrinks: false,
      drinks:'',
      entree:'Deep dish pizza',
      isWine: true,
      wine:'Chianti',
      dessert:'Cheesecake',
      author: 'Karl Xarm',
      upvotes: 105,
      downvotes: 36
  }
  ];
})();
