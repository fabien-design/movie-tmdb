import React from "react";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";

interface RatingStarsProps {
    ratingHandle: (value: number) => void;
    className?: string;
    readOnly?: boolean;
    defaultValue?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    ratingHandle,
    className,
    readOnly,
    defaultValue,
}) => {
    const [value, setValue] = React.useState<number | null>(defaultValue ? defaultValue : 0);
    const [hover, setHover] = React.useState(-1);

    const handleChange = (
        _: React.ChangeEvent<{}>,
        newValue: number | null
    ) => {
        setValue(newValue);
        if (newValue) {
            ratingHandle(newValue);
        }
    };

    return (
        <Box sx={{ width: 200, display: "flex", alignItems: "center" }}>
            <Rating
                name="rating"
                value={value}
                precision={0.5}
                max={10}
                onChange={handleChange}
                onChangeActive={(_, newHover) => {
                    setHover(newHover);
                }}
                emptyIcon={
                    <StarIcon style={{ color: "#fff" }} fontSize="inherit" />
                }
                className={`${className}`}
                readOnly={readOnly}
            />
            <Box sx={{ ml: 2, display: "flex", gap: 0.5 }}>
                <span>{hover !== -1 ? hover : value}</span>
                <span>/10</span>
            </Box>
        </Box>
    );
};

export default RatingStars;
