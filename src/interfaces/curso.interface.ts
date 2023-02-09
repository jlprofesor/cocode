// Interface que da tipo a los cursos que vienen de Firestore
export interface ICurso {
  id?: string;
  nombre: string;
  actual: boolean;
}
