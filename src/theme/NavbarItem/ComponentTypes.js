import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import LangSwitch from '@site/src/components/LangSwitch';
import SiteHome from '@site/src/components/SiteHome';

// Registreert de custom navbar-itemtypes (zie docusaurus.config.js).
export default {
  ...ComponentTypes,
  'custom-langSwitch': LangSwitch,
  'custom-siteHome': SiteHome,
};
