esma_check_if_debug()

esma_add_subdirectories(
  GMAO_mpeu
  GMAO_pilgrim
  GMAO_etc
  GMAO_pFIO 
  MAPL_Base 
  GEOS_Shared
  GMAO_hermes
  GEOS_Util 
  Chem_Base
  Chem_Shared
  LANL_Shared
  GMAO_perllib
  GMAO_transf
  GMAO_stoch

  GEOS_Pert
  GMAO_mfhdf3
  GMAO_gfioeos
  GMAO_psas
  GMAO_gems
  GMAO_iret
  GMAO_radmon

  GMAO_ncdiag
  arpack
  pnagpack
  )

if(NOT NO_F2PY)
  esma_add_subdirectories(GMAO_ods, GMAO_pyobs)
endif()


# Special cases - GMAO_gfio, and GFDL_fms are built twice with two
# different precisions.
add_subdirectory (GMAO_gfio GMAO_gfio_r4)
add_subdirectory (GMAO_gfio GMAO_gfio_r8)
add_dependencies (GMAO_gfio_r4 GMAO_gfio_r8)

add_subdirectory (GFDL_fms GFDL_fms_r4)
add_subdirectory (GFDL_fms GFDL_fms_r8)
