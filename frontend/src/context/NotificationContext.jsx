import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import NotificationCenter from '../components/NotificationCenter.jsx';
import { registerNotifier } from '../services/api.js';

const NotificationContext = createContext();

export function NotificationProvider(props) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback(function (id) {
    setItems(function (prev) { return prev.filter(function (item) { return item.id !== id; }); });
  }, []);

  const notify = useCallback(function (message, type) {
    var id = Date.now() + Math.random();
    var variant = type || 'info';
    setItems(function (prev) {
      return prev.concat([{ id: id, message: message, type: variant }]);
    });
    setTimeout(function () { dismiss(id); }, 4000);
  }, [dismiss]);

  useEffect(function () {
    function handle(type, message) {
      notify(message, type);
    }
    registerNotifier(handle);
    return function () { registerNotifier(null); };
  }, [notify]);

  const value = useMemo(function () {
    return {
      notify: notify,
      dismiss: dismiss,
      items: items
    };
  }, [notify, dismiss, items]);

  return (
    <NotificationContext.Provider value={value}>
      {props.children}
      <NotificationCenter />
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node
};

export function useNotification() {
  return useContext(NotificationContext);
}
