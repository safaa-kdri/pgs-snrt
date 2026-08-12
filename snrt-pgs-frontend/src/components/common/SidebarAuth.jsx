// src/components/common/SidebarAuth.jsx
// ⚠️ MODIFICATIONS UNIQUEMENT SUR LES ESPACEMENTS ET HAUTEURS
// AUCUN CHANGEMENT DE CONTENU

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { logout, login } from "../../store/slices/authSlice";
import {
  DescriptionOutlined,
  VpnKeyOutlined,
  LogoutOutlined,
} from "@mui/icons-material";

// ============================================
// STYLES
// ============================================

// ✅ CARTE 1 : HAUTEUR RÉDUITE
const SideCard = styled(Card)({
  backgroundColor: "#f7f7f7",
  borderRadius: "19px",
  padding: "28px 16px 16px", // ✅ Padding réduit (était 50px 16px 16px)
  textAlign: "center",
  minHeight: "auto", // ✅ Supprimé minHeight: 350px
  maxWidth: "285px",
  width: "100%",
  margin: "0 auto",
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "& h2": {
    margin: "0 0 18px",
    color: "#4a4a4a",
    fontSize: "18px",
    lineHeight: 1.2,
    fontWeight: 700,
    fontFamily: '"Inter", sans-serif',
  },
});

// ✅ CARTE 2 : REMONTÉE VERS LE HAUT
const SnrtContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "100%",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "14px", // ✅ Réduit (était 16px)
  marginTop: "6px", // ✅ RÉDUIT (était 16px) - Rapproche les cartes
});

const AttemptsText = styled(Typography)({
  margin: "10px 0 18px",
  color: "#687480",
  fontSize: "13px",
  lineHeight: 1.6,
  fontFamily: "Inter, sans-serif",
  textAlign: "center",
  "& strong": { fontWeight: 700 },
});

// ============================================
// ⬇️ STYLES DES CHAMPS DE SAISIE
// ============================================

const StyledTextField = styled(TextField)({
  width: "100%",
  maxWidth: "175px",
  margin: "0 auto 10px",
  display: "block",

  "& .MuiOutlinedInput-root": {
    borderRadius: "27px",
    backgroundColor: "#ffffff",
    height: "50px",

    "& fieldset": {
      borderColor: "#e1e6eb",
    },

    "&:hover fieldset": {
      borderColor: "#e1e6eb",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#148aa0",
    },
  },

  "& .MuiInputBase-input": {
    padding: "0 20px 0 45px",
    fontSize: "15px",
    color: "#6d7884",
    fontFamily: "Inter, sans-serif",
  },

  "& .MuiInputAdornment-root": {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aab1b8",
    zIndex: 1,
    pointerEvents: "none",
  },
});

// ============================================
// ⬇️ STYLES DU CAPTCHA
// ============================================

const CaptchaBox = styled(Box)({
  height: "42px",
  margin: "6px 0",
  background: "#f7f7f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  borderRadius: "6px",
  "& svg": {
    width: "140px",
    height: "40px",
  },
});

const CaptchaInput = styled(TextField)({
  width: "120px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    height: "36px",
    backgroundColor: "#ffffff",
    "& fieldset": { borderColor: "#e1e6eb" },
  },
  "& .MuiInputBase-input": {
    padding: "0 14px",
    fontSize: "14px",
    color: "#6d7884",
    fontFamily: "Inter, sans-serif",
  },
});

const GrayButton = styled(Button)({
  height: "36px",
  border: 0,
  borderRadius: "5px",
  padding: "0 12px",
  backgroundColor: "#68727c",
  color: "#fff",
  fontSize: "12px",
  fontFamily: "Inter, sans-serif",
  textTransform: "none",
  minWidth: "80px",
  "&:hover": { backgroundColor: "#555" },
});

const LoginButton = styled(Button)({
  width: "100%",
  height: "50px",
  marginBottom: "8px",
  maxWidth: "175px",
  marginLeft: "auto",
  marginRight: "auto",
  borderRadius: "27px",
  backgroundColor: "#148aa0",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  "&:hover": { backgroundColor: "#0b7890" },
  "& i": { marginRight: "8px" },
});

const CaptchaWrapper = styled(Box)({
  display: "flex",
  gap: "8px",
  marginBottom: "12px",
  justifyContent: "center",
  width: "100%",
  maxWidth: "175px",
});

const ForgotLink = styled(Button)({
  color: "#075fff",
  fontSize: "14px",
  textDecoration: "underline",
  display: "block",
  marginBottom: "12px",
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "Inter, sans-serif",
  textTransform: "none",
  "&:hover": { opacity: 0.8 },
});

const TermsText = styled(Typography)({
  width: "120px",
  margin: "0 auto",
  color: "#000",
  fontSize: "12px",
  lineHeight: 1.5,
  fontFamily: "Inter, sans-serif",
  "& a": { color: "#075fff" },
});

// ============================================
// ✅ STYLES POUR LA VERSION CONNECTÉE
// ============================================

// ✅ "Bienvenue," en noir (ligne 1)
const WelcomeText = styled(Typography)({
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  color: "#1a2332",
  marginBottom: "2px",
  lineHeight: 1.2,
});

// ✅ Nom en gras (ligne 2) - DYNAMIQUE
const WelcomeName = styled(Typography)({
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  fontWeight: 700,
  color: "#1a2332",
  marginBottom: "16px", // ✅ Réduit (était 20px)
  lineHeight: 1.2,
});

// ✅ LIEN "Suivi des offres" - bleu, souligné, centré
const StyledLink = styled(Button)({
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  color: "#0066FF",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
  textTransform: "none",
  padding: "2px 0", // ✅ Réduit (était 4px 0)
  minWidth: "auto",
  "&:hover": {
    color: "#0044CC",
    backgroundColor: "transparent",
  },
});

// ✅ LIEN "Changer mon mot de passe" - bleu, souligné, centré
const StyledLink2 = styled(Button)({
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  color: "#0066FF",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
  textTransform: "none",
  padding: "2px 0", // ✅ Réduit (était 4px 0)
  minWidth: "auto",
  marginBottom: "20px", // ✅ Réduit (était 28px)
  "&:hover": {
    color: "#0044CC",
    backgroundColor: "transparent",
  },
});

// ✅ BOUTON DÉCONNEXION - bleu/turquoise, bord arrondi
const LogoutBtn = styled(Button)({
  width: "100%",
  maxWidth: "220px",
  height: "42px", // ✅ Réduit (était 45px)
  borderRadius: "25px",
  backgroundColor: "#1689A3",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  "&:hover": {
    backgroundColor: "#0e6f85",
  },
});

// ✅ SECTION SNRT - CONTENU CONSERVÉ, SEUL L'ESPACEMENT CHANGE
const SnrtContainerStyled = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "100%",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "14px",
  marginTop: "6px", // ✅ RÉDUIT - Rapproche les cartes
});

const SnrtLink = styled(Button)({
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  color: "#1a2332",
  justifyContent: "flex-start",
  gap: "10px",
  padding: "6px 4px",
  "&:hover": {
    color: "#148aa0",
    backgroundColor: "transparent",
  },
  "& .MuiButton-startIcon": {
    color: "#148aa0",
  },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SidebarAuth = () => {
  console.log("SidebarAuth mounted — file updated:", new Date().toISOString());
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    regenerateCaptcha();
  }, [location.pathname]);

  const regenerateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const usedChars = new Set();
    while (result.length < 6) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      if (!usedChars.has(char)) {
        usedChars.add(char);
        result += char;
      }
    }
    setCaptchaText(result);
    setCaptchaInput("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!cin || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      setError("CAPTCHA incorrect");
      regenerateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        login({ cin, motDePasse: password })
      ).unwrap();

      if (result?.requiresTwoFactor) {
        localStorage.setItem("2faEmail", cin);
        navigate("/verify-2fa", { replace: true });
        return;
      }

      if (result?.user) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setAttempts((prev) => prev + 1);
      setError(err || "Erreur de connexion");
      regenerateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isBlocked = attempts >= 3;

  // ========================================== //
  // ✅ VERSION CONNECTÉE - HAUTEUR RÉDUITE
  // ========================================== //
  if (isAuthenticated && user) {
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim() || "Utilisateur";

    return (
      <SideCard>
        <Box sx={{ width: "100%", maxWidth: "220px", textAlign: "center" }}>
          {/* ✅ "Bienvenue," (ligne 1) */}
          <WelcomeText>Bienvenue,</WelcomeText>

          {/* ✅ Nom dynamique (ligne 2) */}
          <WelcomeName>{fullName} !</WelcomeName>

          {/* ✅ Lien 1 : Suivi des offres */}
          <StyledLink onClick={() => navigate("/dashboard/applications")}>
            Suivi des offres
          </StyledLink>

          {/* ✅ Lien 2 : Changer mon mot de passe */}
          <StyledLink2 onClick={() => navigate("/profile")}>
            Changer mon mot de passe
          </StyledLink2>

          {/* ✅ Bouton Déconnexion */}
          <LogoutBtn onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "16px" }}></i>
            Déconnexion
          </LogoutBtn>
        </Box>
      </SideCard>
    );
  }

  // ========================================== //
  // ❌ VERSION NON CONNECTÉE (Formulaire - inchangé)
  // ========================================== //
  return (
    <SideCard>
      <Box sx={{ position: "absolute", top: 6, right: 8 }}>
        <Typography variant="caption" sx={{ fontSize: 10, color: "#999" }}>
          DEV: SidebarAuth
        </Typography>
      </Box>
      <h2>Authentification</h2>

      <AttemptsText>
        <div>Vous avez <strong>3 tentatives</strong> pour</div>
        <div>entrer un mot de passe</div>
        <div>correct. Après la 3ème</div>
        <div>tentative incorrecte, votre </div> 
        <div>compte sera <strong>bloqué pendant</strong></div>
        <div><strong>60 minutes.</strong></div>
      </AttemptsText>

      {error && (
        <Typography
          color="error"
          sx={{ mb: 1, fontSize: "13px", fontFamily: "Inter, sans-serif" }}
        >
          {error}
        </Typography>
      )}

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <StyledTextField
          placeholder="CIN"
          value={cin}
          onChange={(e) => setCin(e.target.value)}
          disabled={loading || isBlocked}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="fa-solid fa-envelope" style={{ fontSize: 15, color: "#aab1b8" }}></i>
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />

        <StyledTextField
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || isBlocked}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="fa-solid fa-lock" style={{ fontSize: 15, color: "#aab1b8" }}></i>
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />

        <CaptchaBox>
          <svg viewBox="0 0 240 70" aria-hidden="true">
            <path
              d="M7 17 C45 35, 82 2, 132 25 S205 12, 232 32"
              fill="none"
              stroke="#589dff"
              strokeWidth="2"
            />
            <path
              d="M10 48 C64 28, 115 58, 230 17"
              fill="none"
              stroke="#ef5fb0"
              strokeWidth="2"
            />
            {captchaText.split("").map((char, index) => {
              const colors = [
                "#75e45e",
                "#65e4d6",
                "#59e2d8",
                "#3364f0",
                "#ff65c8",
                "#65e45e",
              ];
              const rotates = [-4, 6, -7, 9, -5, 7];
              return (
                <text
                  key={index}
                  x={15 + index * 38}
                  y="50"
                  fontSize="50"
                  fontFamily="Trebuchet MS"
                  fill={colors[index % 6]}
                  transform={`rotate(${rotates[index % 6]} ${15 + index * 38} 50)`}
                >
                  {char}
                </text>
              );
            })}
          </svg>
        </CaptchaBox>

        <CaptchaWrapper>
          <CaptchaInput
            placeholder="Saisissez"
            variant="outlined"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            disabled={loading || isBlocked}
          />
          <GrayButton
            onClick={regenerateCaptcha}
            disabled={loading || isBlocked}
          >
            Régénérer
          </GrayButton>
        </CaptchaWrapper>

        <LoginButton type="submit" disabled={loading || isBlocked}>
          <i className="fa-solid fa-arrow-right-to-bracket"></i>
          {loading ? "Connexion..." : "Se connecter"}
        </LoginButton>
      </form>

      <ForgotLink onClick={() => navigate("/forgot-password")}>
        mot de passe oublié
      </ForgotLink>

      <TermsText>
        En vous connectant, vous acceptez nos{" "}
        <a href="/terms">Termes et Conditions</a> du service
      </TermsText>
    </SideCard>
  );
};

export default SidebarAuth;