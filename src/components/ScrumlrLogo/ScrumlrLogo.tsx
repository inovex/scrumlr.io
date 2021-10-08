import classNames from "classnames";
import "./ScrumlrLogo.scss";

interface ScrumlrLogoProps {
  accentColorClassNames?: string[];
  className?: string;
}

export const ScrumlrLogo = ({accentColorClassNames, className}: ScrumlrLogoProps) => {
  const gradientStops = [<stop key="gradient-default-stop" className="scrumlr-logo__stop" />];

  if (accentColorClassNames && accentColorClassNames.length > 0) {
    // remove default gradient stop
    gradientStops.pop();

    const stopInterval = Number((1 / accentColorClassNames.length).toFixed(2));
    for (let i = 0; i < accentColorClassNames.length; i++) {
      gradientStops.push(<stop key={`gradient-stop${i}-start`} offset={stopInterval * i} className={`${accentColorClassNames[i]} scrumlr-logo__stop`} />);

      gradientStops.push(
        <stop
          key={`gradient-stop${i}-end`}
          offset={stopInterval === accentColorClassNames.length - 1 ? 1 : stopInterval * (i + 1)}
          className={`${accentColorClassNames[i]} scrumlr-logo__stop`}
        />
      );
    }
  }

  return (
    <svg version="1.1" viewBox="0 0 114 48" className={classNames("scrumlr-logo", className)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrumlr-logo__gradient" x1="0" y1="0" x2="1" y2="0">
          {gradientStops}
        </linearGradient>
      </defs>

      <g className="scrumlr-logo__paths">
        <path
          className="scrumlr-logo__text--desktop"
          d="M98.828 8.15c1.348-2.427 2.379-4.05 2.537-3.996.238.12-.278 1.866-1.625 4.218a29.128 29.128 0 0 1-3.965 5.365c.28-.686 2.022-3.776 3.053-5.587m14.548 8.322c.277.499.318 1.408-.119 2.494-.952 2.299-3.29 4.246-5.548 4.546-2.42.32-3.728-1.145-3.728-3.202 0-2.44 2.1-5.654 4.084-8.24a9.47 9.47 0 0 1-2.894.993c-2.974 5.348-5.232 9.154-5.788 11.858-.159.706-.674 1.116-1.387.486-.543-.417-.844-.995-.944-1.641-.985.675-2.096 1.207-3.258 1.36-1.914.253-3.24-.418-3.718-2.006-1.375 1.688-3.45 3.07-5.322 3.32-2.696.356-4.162-.86-4.162-2.918 0-.687.158-1.546.594-2.556.633-1.38 1.943-3.61 2.854-5.103.872-1.375 1.824-2.643 1.506-2.601s-1.15.533-3.488 3.092c-3.093 3.381-4.994 7.254-6.66 11.019-.396.778-.95.965-1.585.438-.596-.492-.872-.988-.872-1.98 0-.647.316-1.908.714-2.916.554-1.444 1.862-3.675 2.931-5.418 1.072-1.855 2.182-3.453 1.824-3.405-.317.043-1.861 1.086-4.24 3.916-2.22 2.58-4.044 6.29-5.589 10-.28.648-.713.935-1.388.451a2.16 2.16 0 0 1-.682-.757c-1.09.893-2.34 1.54-3.56 1.702-2.339.31-3.53-.639-3.687-2.332-1.348 1.627-3.131 3.043-5.154 3.312-1.383.183-2.18-.396-2.552-1.3-1.32 1.267-3.044 2.157-4.465 2.344-2.537.336-3.926-1.158-3.926-3.407 0-1.981 2.101-5.88 4.283-8.645-1.072.56-2.182.938-3.092 1.096-2.855 6.475-7.296 12.245-12.33 12.912-3.647.484-5.628-1.539-5.628-4.513 0-1.333.397-2.911 1.189-4.54 2.102-4.166 5.232-6.713 7.532-7.019.515-.068.99-.055 1.387.122 1.19.528 1.902 1.119 2.34 1.862.593 1.14-.04 2.595-.795 4.183-.276.607-.594 1.222-.713 1.656-.278.838-.435 1.048-1.425.685-.794-.277-1.389-.998-1.389-2.025 0-.573.517-1.9.912-2.827.395-.855.792-1.669.595-1.795-.516-.313-3.054 2.35-4.718 5.807-.792 1.667-1.19 3.245-1.19 4.39 0 1.6.675 2.577 1.824 2.5 3.884-.362 8.126-6.488 10.187-11.448-.831-.269-1.11-.806-1.11-1.528 0-2.02 2.617-5.15 3.965-5.366.832-.11 1.15.343 1.15 1.181 0 .8-.318 1.986-.753 3.301 1.109-.415 2.18-1.051 3.45-2.095.593-.498 1.228-.736 1.743-.27.633.602 1.11 1.453 1.11 2.445 0 .457-.198 1.055-.674 1.615-1.704 2.13-3.648 4.863-4.282 6.969-.198.597-.317 1.185-.317 1.756 0 .953.317 1.483.912 1.443 1.255-.06 3.289-2.44 4.524-5.016.892-2.522 2.885-6.532 5.309-10.121.515-.718 1.229-.737 1.705-.227.434.476.594 1.102.594 1.674 0 1.563-2.895 6.366-4.281 9.487-.714 1.618-.834 3.042.04 2.928 1.03-.137 3.132-3.006 5.154-6.323 2.338-3.97 3.368-6.697 4.794-8.638.557-.797 1.19-1.034 1.667-.45.397.48.594 1.066.594 1.903 0 1.296-.832 3.083-2.22 5.478-1.15 1.941-2.695 4.739-2.695 6.225 0 .687.238 1.036.753.967.958-.126 2.298-1.719 3.509-3.579.935-2.526 3.67-7.936 6.006-11.667.515-.791 1.109-.834 1.505-.2.357.526.556 1.146.556 1.757a5.2 5.2 0 0 1-.12 1.044c1.705-1.827 3.924-3.568 5.194-3.737s2.101 1.094 2.101 2.694c1.783-1.76 3.883-3.335 5.153-3.465 1.15-.114 1.783.832 1.783 2.088 0 1.297-.832 3.161-2.456 5.775-1.11 1.787-2.142 3.601-2.142 4.933 0 .878.397 1.435 1.032 1.352 1.228-.163 3.17-3.09 4.638-5.607.099-.175.203-.298.308-.391 1.69-6.365 5.978-13.618 9.723-17.898.752-.824 1.465-1.146 2.22-.56.871.609 1.306 1.617 1.306 2.61 0 .531-.038.956-.238 1.631-1.227 4.697-5.549 9.766-9.037 12.478-.793 2.048-1.308 3.83-1.308 5.166 0 .914.237 1.53.753 1.462 1.824-.242 4.123-3.1 5.629-6.043.144-.286.318-.492.497-.632.83-1.31 1.81-2.766 2.832-4.116-.475-.357-.752-.814-.752-1.31 0-1.945 2.538-4.986 3.765-5.148.832-.11 1.189.3 1.189 1.175 0 .726-.276 1.867-.712 3.143.95-.355 2.022-1.028 3.21-2.025.675-.545 1.07-.674 1.586-.248.555.46 1.149 1.373 1.149 2.288 0 .457-.197 1.016-.634 1.568-2.14 2.648-4.4 5.957-4.4 8.206 0 .992.317 1.559.872 1.483 1.348-.177 2.935-2.52 4.162-5.313.317-.728.872-.84 1.229-.202zm-84.282 1.105c-.952 1.346-2.1 3.479-2.654 4.468-.357.657-.795 1.02-1.547.357-.555-.459-.952-1.056-.952-1.931 0-.84.515-2.357 1.824-4.207.992-1.542 2.06-3.36 1.507-3.667-1.467-.834-10.148 5.917-10.347 10.326-.12 2.531 5.312 3.984 6.856 4.848.755.433 1.192 1.062 1.192 1.785 0 .877-.517 1.936-1.547 3.254-1.032 1.28-2.973 2.338-5.352 2.652-2.894.383-6.739-.67-9.871-3.721-.554-.577-.277-1.032.278-1.296.318-.119.753-.215 1.229-.278 1.15-.153 2.259.006 3.09.544 1.548 1.015 4.165 2.574 6.463 2.27.872-.116 1.665-.411 2.103-.888.593-.652.394-1.31-.041-1.597-2.854-1.755-8.364-3.085-8.364-6.972 0-5.183 6.183-10.536 9.753-12.457 1.307-.707 2.14-.932 3.05-1.052.953-.126 1.745.037 2.418.48 1.112.844 1.824 2.007 2.102 3 .396 1.51-.595 3.165-1.19 4.082z"
          fillRule="evenodd"
        />
        <path
          className="scrumlr-logo__underline--desktop"
          fill="url(#scrumlr-logo__gradient)"
          d="M.884 47.523S48.86 32.596 109.857 30.136c1.44-.057 2.655.815 2.655 1.903 0 1.008-1.038 1.84-2.371 1.896-11.103.472-59.25 3.044-103.032 13.588 0 .162-6.225.973-6.225 0"
        />

        <path
          className="scrumlr-logo__text--mobile"
          d="M37.395 13.248l-.975 1.487-.633 1.051-1.094 1.913-.841 1.513c-.666 1.225-1.515 1.533-2.597.579-.914-.755-1.403-1.671-1.403-2.857 0-1.382.884-3.544 2.504-5.833l1.769-3.042c.395-.841.475-1.339.375-1.395-.768-.436-4.063 1.444-7.188 4.247-3.624 3.25-6.081 6.771-6.195 9.33-.073 1.523 1.561 2.882 4.673 4.298.58.264 3.828 1.597 4.363 1.896 1.127.646 1.772 1.603 1.772 2.694 0 1.257-.706 2.732-2.154 4.583-1.509 1.872-4.258 3.27-7.409 3.684-4.392.582-9.566-1.218-13.55-5.097-.856-.892-.57-1.791.501-2.298.446-.167 1.049-.302 1.725-.392 1.679-.223 3.228.036 4.385.783 3.314 2.174 6.02 3.314 8.446 2.993 1.169-.154 2.121-.543 2.615-1.082.579-.636.509-1.297.019-1.62-.491-.302-1.067-.609-1.8-.97l-2.664-1.268c-4.765-2.298-6.933-4.241-6.933-7.413 0-6.07 6.58-13.418 13.278-17.024 1.637-.885 2.784-1.261 4.216-1.45 1.349-.178 2.497.051 3.499.711 1.45 1.1 2.517 2.677 2.948 4.213.465 1.775-.206 3.539-1.643 5.755l-.288-.187.28.198z"
        />
        <path
          className="scrumlr-logo__underline--mobile"
          d="M6 50.708s15.827-11.077 34.678-12.573c.445-.035.821.496.821 1.157 0 .613-1.321 3.119-1.733 3.153-3.431.287-18.311 1.851-31.842 8.262 0 .099-1.924.592-1.924 0"
        />
      </g>
    </svg>
  );
};
