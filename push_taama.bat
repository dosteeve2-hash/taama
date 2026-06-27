@echo off
echo ===================================================
echo  TAAMA - Init Git et Push vers GitHub
echo ===================================================
echo.

cd /d "C:\Users\pc\Documents\GitHub\taama"
echo [1/6] Repertoire : %CD%
echo.

echo [2/6] git init...
git init
git config user.email "docompaore2@gmail.com"
git config user.name "Steve Donald"

echo.
echo [3/6] git add...
git add .
echo Fichiers ajoutes.

echo.
echo [4/6] git commit...
git commit -m "feat: TAAMA v1.0 - SaaS industriel BF complet

- Auth multi-etapes (org + site + profil)
- Module Production : lots, entrees/sorties, rendement auto
- Inventaire temps reel avec alertes seuil
- Catalogue matieres et fournisseurs
- Rapports avec export CSV
- Tracabilite EUDR (conformite decembre 2026)
- Parametres multi-sites
- Sidebar responsive mobile
- 11 tables Supabase avec RLS multi-tenant"

echo.
echo [5/6] git remote + push...
git remote add origin https://github.com/dosteeve2-hash/taama.git
git branch -M main
git push -u origin main

echo.
echo ===================================================
echo  DONE ! Verifiez : https://github.com/dosteeve2-hash/taama
echo ===================================================
echo.
pause
