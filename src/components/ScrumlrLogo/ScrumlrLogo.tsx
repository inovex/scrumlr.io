import classNames from "classnames";
import { Color, getColorClassName } from "constants/colors";
import { useAutoTheme } from "utils/hooks/useAutoTheme";
import { useAppSelector } from "store";
import "./ScrumlrLogo.scss";

interface ScrumlrLogoProps {
  className?: string;
}

export const ScrumlrLogo = ({ className }: ScrumlrLogoProps) => {
  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);
  const gradientStops = [<stop key="gradient-default-stop" className="scrumlr-logo__stop" />];
  const gradientColorsLight: Color[] = ["backlog-blue"];
  const gradientColorsDark: Color[] = ["backlog-blue", "value-violet", "poker-purple", "planning-pink"];

  const gradientColors = autoTheme === "light" ? gradientColorsLight : gradientColorsDark;

  // remove default gradient stop
  gradientStops.pop();

  const stopInterval = Number((1 / gradientColors.length).toFixed(2));
  for (let i = 0; i < gradientColors.length; i += 1) {
    const accentColorClassname = getColorClassName(gradientColors[i]);
    gradientStops.push(
      <stop key={`gradient-stop${i}-start`} offset={stopInterval * i} className={classNames("scrumlr-logo__stop", accentColorClassname)} />
    );

    gradientStops.push(
      <stop
        key={`gradient-stop${i}-end`}
        offset={stopInterval === gradientColors.length - 1 ? 1 : stopInterval * (i + 1)}
        className={classNames("scrumlr-logo__stop", accentColorClassname)}
      />
    );
  }

  return (
    <>
      <svg
        version="1.1"
        viewBox="0 0 114 48"
        className={classNames("scrumlr-logo", "scrumlr-logo--desktop", className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scrumlr-logo__gradient" x1="0" y1="0" x2="1" y2="0">
            {gradientStops}
          </linearGradient>
        </defs>

        <g className="scrumlr-logo__paths">
          <text
            x="10"
            y="35"
            fontFamily="'Be Vietnam Pro'"
            fontSize="35"
            fill="white"
          >
            AIQOS
          </text>
          <path
            fill="url(#scrumlr-logo__gradient)"
            d="M.884 47.523S48.86 32.596 109.857 30.136c1.44-.057 2.655.815 2.655 1.903 0 1.008-1.038 1.84-2.371 1.896-11.103.472-59.25 3.044-103.032 13.588 0 .162-6.225.973-6.225 0"
          />
        </g>
      </svg>

      <svg
        version="1.1"
        viewBox="0 0 44 48"
        className={classNames("scrumlr-logo", "scrumlr-logo--mobile", className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="scrumlr-logo__paths">
          <text
            x="5"
            y="30"
            fontFamily="'Be Vietnam Pro'"
            fontSize="20"
            fill="white"
          >
            AIQOS
          </text>
          <path
            fill="url(#scrumlr-logo__gradient)"
            d="M6 50.708s15.827-11.077 34.678-12.573c.445-.035.821.496.821 1.157 0 .613-1.321 3.119-1.733 3.153-3.431.287-18.311 1.851-31.842 8.262 0 .099-1.924.592-1.924 0"
          />
        </g>
      </svg>
    </>
  );
};
