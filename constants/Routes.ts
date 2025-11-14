interface MenuRoute {
  title: string,
  name: string
}

export const menuRoutes: MenuRoute[] = [
  {
    title: '',
    name: 'login/index'
  },

  {
    title: '',
    name: 'register/index'
  },

  {
    title: '',
    name: 'transferir/index'
  },

  {
    title: '',
    name: 'movimientos/index'
  },

  {
    title: '',
    name: 'nuevo_destinatario/index'
  },

  {
    title: '',
    name: 'datos/index'
  },

  {
    title: '',
    name: 'notificaciones/index'
  }
]

export const allRoutes: MenuRoute[] = [...menuRoutes]