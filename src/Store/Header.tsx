// @ts-nocheck

import './Header.css';
import { AppBar, Badge, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { CategoryDetails, StoreData } from '../data/store-data';
import { Event, initialize } from '@harnessio/ff-javascript-client-sdk';
import { Link, Router, useHistory, useParams } from 'react-router-dom';
import { Menu as MenuIcon, ShoppingCart } from '@material-ui/icons';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';

export default function Header() {
  const storeData = useMemo(() => new StoreData(), []);
  const { cart } = useContext(CartContext);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [categories, setCategories] = useState([] as CategoryDetails[]);
  const [featureFlags, setFeatureFlags] = useState({});
  //const { id }: { id: string } = useParams();
  const history = useHistory();

  useEffect(() => {
    let id = 'Guest';
    const cf = initialize('your-token-here', {
      identifier: id,
      attributes: {
        email: 'email@harness.io',
      },
    });

    cf.on(Event.READY, flags => {
      setFeatureFlags(flags);
      console.log(flags);
    });

    cf.on(Event.CHANGED, flagInfo => {
      console.log(flagInfo);
      if (flagInfo.deleted) {
        setFeatureFlags(currentFeatureFlags => {
          delete currentFeatureFlags[flagInfo.flag];
          return { ...currentFeatureFlags };
        });
      } else {
        setFeatureFlags(currentFeatureFlags => ({ ...currentFeatureFlags, [flagInfo.flag]: flagInfo.value }));
      }
    });
    storeData.getCategories().then(data => setCategories(data));
  }, [storeData]);

  const handleMenuClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (category: CategoryDetails) => {
    history.push(`/list/${category.name}`);
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCartClick = (event: React.MouseEvent) => {
    history.push('/cart');
  };

  let title = featureFlags.titulo;

  return (
    <AppBar position="sticky" className="Header">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>
        <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {categories.map(cat => (
            <MenuItem key={cat.name} onClick={event => handleMenuItemClick(cat)}>
              {cat.title}
            </MenuItem>
          ))}
        </Menu>
        <Typography variant="h6" className="heading">
          <Link to="/">{title}</Link>
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="shopping cart" onClick={handleCartClick}>
          <Badge badgeContent={StoreData.getCartSize(cart)} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
