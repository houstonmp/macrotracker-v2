import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import classes from './PageContent.module.css';
import { uiActions } from './store/ui-slice';

function PageContent({ title, children, pageClass }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.ui.userPreferences.user)

  useEffect(() => {
    if (user.initialize) {
      dispatch(uiActions.showModal({
        title: 'Entry',
        message: 'Let\'s get you started!',
        componentName: 'initialize',
        disableExit: false
      }))
    } else {
      dispatch(uiActions.closeModal())
    }
  }, [user.initialize])

  return (
    <>
      <h1 className={classes.header}>{title}</h1>
      <div className={`${classes.container} ${pageClass}`}>
        {children}
      </div>
    </>

  );
}

export default PageContent;