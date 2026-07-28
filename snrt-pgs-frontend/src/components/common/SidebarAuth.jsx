// src/components/common/SidebarAuth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  PersonOutline,
  DescriptionOutlined,
  VpnKeyOutlined,
  LogoutOutlined,
} from "@mui/icons-material";

// ============================================
// STYLES
// ============================================

const SideCard = styled(Card)({
  backgroundColor: "#f7f7f7",
  borderRadius: "19px",
  padding: "32px 20px 20px",
  textAlign: "center",
  minHeight: "480px",
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "& h2": {
    margin: "0 0 18px",
    color: "#07111b",
    fontSize: "18px",
    lineHeight: 1.2,
    fontWeight: 400,
    fontFamily: '"Inter", sans-serif',
  },
});

const AttemptsText = styled(Typography)({
  margin: "0 0 18px",
  color: "#687480",
  fontSize: "13px",
  lineHeight: 1.5,
  fontFamily: "Inter, sans-serif",
  "& strong": { fontWeight: 700 },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "27px",
    backgroundColor: "#ffffff",
    height: "42px",
    "& fieldset": { borderColor: "#e1e6eb" },
    "&:hover fieldset": { borderColor: "#e1e6eb" },
    "&.Mui-focused fieldset": { borderColor: "#148aa0" },
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
  width: "100%",
  maxWidth: "220px",
  margin: "0 auto 10px",
  display: "block",
});

const CaptchaBox = styled(Box)({
  height: "42px",
  margin: "6px 0",
  background: "#e8e8e8",
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
  width: "120px",
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
  height: "42px",
  marginBottom: "8px",
  maxWidth: "220px",
  marginLeft: "auto",
  marginRight: "auto",
  borderRadius: "23px",
  backgroundColor: "#148aa0",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  "&:hover": { backgroundColor: "#0b7890" },
  "& i": { marginRight: "8px" },
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
// STYLES POUR LA VERSION CONNECTÉE (PRO)
// ============================================

const WelcomeText = styled(Typography)({
  fontFamily: "Inter, sans-serif",
  fontSize: "20px",
  fontWeight: 700,
  color: "#1a2332",
  marginBottom: "4px",
});

const DashboardLink = styled(Button)({
  width: "100%",
  maxWidth: "220px",
  borderRadius: "12px",
  padding: "10px 16px",
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  justifyContent: "flex-start",
  gap: "12px",
  color: "#1a2332",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  "&:hover": {
    backgroundColor: "#f0f7fa",
    borderColor: "#148aa0",
  },
});

const LogoutButton = styled(Button)({
  width: "100%",
  maxWidth: "220px",
  borderRadius: "12px",
  padding: "10px 16px",
  textTransform: "none",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  justifyContent: "flex-start",
  gap: "12px",
  color: "#ef4444",
  backgroundColor: "#ffffff",
  border: "1px solid #fecaca",
  "&:hover": {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SidebarAuth = () => {
  console.log("SidebarAuth mounted — file updated:", new Date().toISOString());
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [cin, setCin] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("0vty6d");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

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
  // ✅ VERSION CONNECTÉE
  // ========================================== //
  if (isAuthenticated && user) {
    return (
      <SideCard>
        <Box sx={{ width: "100%", maxWidth: "220px", textAlign: "center" }}>
          <WelcomeText>
            Bienvenue {user.prenom || user.nom || "Utilisateur"}
          </WelcomeText>

          <Divider sx={{ width: "100%", my: 2, borderColor: "#e5e7eb" }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
            }}
          >
            <DashboardLink
              onClick={() => navigate("/dashboard/applications")}
              startIcon={<DescriptionOutlined />}
            >
              Suivi de mes offres
            </DashboardLink>

            <DashboardLink
              onClick={() => navigate("/profile")}
              startIcon={<VpnKeyOutlined />}
            >
              Changer mot de passe
            </DashboardLink>

            <LogoutButton onClick={handleLogout} startIcon={<LogoutOutlined />}>
              Déconnexion
            </LogoutButton>
          </Box>
        </Box>
      </SideCard>
    );
  }

  // ========================================== //
  // ❌ VERSION NON CONNECTÉE (Formulaire)
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
        Vous avez <strong>{3 - attempts}</strong> tentative(s) restante(s).
        Après la 3ème tentative incorrecte, votre compte sera{" "}
        <strong>bloqué pendant 60 minutes.</strong>
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
                <i className="fa-solid fa-id-card" style={{ fontSize: 18, color: "#aab1b8" }}></i>
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
                <i className="fa-solid fa-lock" style={{ fontSize: 18, color: "#aab1b8" }}></i>
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

        <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "center" }}>
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
        </Box>

        <LoginButton type="submit" disabled={loading || isBlocked}>
          <i className="fa-solid fa-arrow-right-to-bracket"></i>
          {loading ? "Connexion..." : "Se connecter"}
        </LoginButton>
      </form>

      <ForgotLink onClick={() => navigate("/forgot-password")}>
        Mot de passe oublié !
      </ForgotLink>

      <TermsText>
        En vous connectant, vous acceptez nos{" "}
        <a href="/terms">Termes et Conditions</a> du service
      </TermsText>
    </SideCard>
  );
};

export default SidebarAuth;