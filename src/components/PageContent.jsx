import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import classes from './PageContent.module.css';
import { uiActions } from './store/ui-slice';

function PageContent({ title, children, pageClass }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(uiActions.closeModal())
  }, [])

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