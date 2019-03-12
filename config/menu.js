mainMenu = function(req, res, next) {
    var menuItems = [
        {
            label: 'Home',
            href: '/'
        }, {
            label: 'Rooms',
            href: '/rooms'
        }, {
            label: 'Users',
            href: '/users'
        }
    ];

    for (var item in menuItems) {
        if (menuItems[item].href == req._parsedUrl.pathname) {
            menuItems[item].class = 'active';
        }
    }

    res.locals.menuItems = menuItems;

    next();
};

module.exports = mainMenu;
