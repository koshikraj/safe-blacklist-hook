// import { RequireAuth, NotFound } from "../components";
import { createHashRouter,RouterProvider, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/home/Home.page';
import { RoutePath } from './route-path';


export const Navigation = () => {
  return (
    <Routes>
      <Route path={RoutePath.home} element={<HomePage />} />
    </Routes>
  );
};

// eslint-disable-next-line arrow-body-style
export const LandingPageNavigation = () => {
  return (
    <>
      {/* <GlobalStyle /> */}
      <Routes>
        <Route path={RoutePath.home} element={<HomePage />} />
      </Routes>
    </>
  );
};
