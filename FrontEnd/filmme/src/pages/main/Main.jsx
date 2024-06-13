import React, { useState, useEffect } from "react";
import * as S from "./style.jsx";
import Card from '../../components/card/Card.jsx'
import Modal from '../../components/card/Modal.jsx';
import searchImage from "../../assets/images/Main/searchImage.png";
import AOS from 'aos';
import axios from 'axios';
import ReactStars from "react-rating-stars-component";

function Main() {
    const [theaters, setTheaters] = useState([]);
    const [clickedRegion, setClickedRegion] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTheaters, setFilteredTheaters] = useState([]);
    const [isPlaceholderHidden, setIsPlaceholderHidden] = useState(false);
    const [sortBy, setSortBy] = useState("ascending");
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [isLikeRequesting, setIsLikeRequesting] = useState(false);
    const [currentMovies, setCurrentMovies] = useState([]);
    const [rating, setRating] = useState(0);
    const regionNames = ["전체", "서울", "인천", "경기", "강원", "대전", "세종", "충남", "충북", "광주", "전남", "전북", "경남", "경북", "대구", "부산", "울산", "제주"];

    // 정렬 옵션 목록
    const sortOptions = [
        { value: "ascending", label: "오름차순" },
        { value: "descending", label: "내림차순" },
        { value: "rating", label: "평점순" },
        { value: "likes", label: "좋아요순" }
    ];

    useEffect(() => {
        AOS.init();
    }, []);

    useEffect(() => {
        axios.get('https://filmme-drf-deploy-932ced3808f2.herokuapp.com/api/cinemas/')
            .then(response => {
                const theatersWithLikeStatus = response.data.map(theater => ({
                    ...theater,
                    isLiked: false
                }));
                setTheaters(theatersWithLikeStatus);
                setFilteredTheaters(theatersWithLikeStatus);
            })
            .catch(error => {
                console.error("영화관 정보를 가져오는 중 오류가 발생했습니다!", error);
            });
    }, []);

    useEffect(() => {
        filterAndSortTheaters();
    }, [searchQuery, sortBy, theaters]);

    const filterAndSortTheaters = () => {
        let filtered = theaters.filter(theater => theater.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (clickedRegion !== 0) {
            filtered = filtered.filter(theater => theater.location === regionNames[clickedRegion]);
        }
        filtered = sortTheaters(filtered);
        setFilteredTheaters(filtered);
    };

    // 검색어 입력 시 placeholder 가리기
    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setIsPlaceholderHidden(true);
    }

    // 지역 선택
    const renderRegions = () => {
        return regionNames.map((regionName, index) => (
            <S.region
                key={index}
                onClick={() => setClickedRegion(index)}
                isActive={clickedRegion === index}
            >
                {regionName}
            </S.region>
        ));
    }

    // 정렬 기능
    const sortTheaters = (theaters) => {
        switch (sortBy) {
            case "ascending":
                return theaters.sort((a, b) => a.name.localeCompare(b.name));
            case "descending":
                return theaters.sort((a, b) => b.name.localeCompare(a.name));
            case "rating":
                return theaters.sort((a, b) => b.star - a.star);
            case "likes":
                return theaters.sort((a, b) => b.like_cnt - a.like_cnt);
            default:
                return theaters;
        }
    }

    // 영화관 리스트
    const ViewTheater = () => {
        let theatersToDisplay = filteredTheaters;

        if (clickedRegion !== 0) {
            theatersToDisplay = filteredTheaters.filter(theater => theater.location === regionNames[clickedRegion]);
        }

        return theatersToDisplay.map(theater => (
            <Card
                key={theater.id}
                id={theater.id}
                name={theater.name}
                region={theater.location}
                star={<ReactStars count={5} value={theater.star} size={24} edit={false} isHalf={true} activeColor="#ffd700" />}
                score={theater.star}
                like={theater.like_cnt}
                img={theater.view_url}
                onClick={() => handleCardClick(theater)}
                isLiked={theater.isLiked}
            />
        ));
    }

    const handleSaveRating = async () => {
        try {
            console.log(`Sending rating ${rating} for cinema ID ${modalContent.id}`);
            const response = await axios.post(`https://filmme-drf-deploy-932ced3808f2.herokuapp.com/api/cinemas/rating/${modalContent.id}/`, { rating });
            if (response.status === 200) {
                console.log("별점이 저장되었습니다.");
                alert("별점이 저장되었습니다.");
            } else {
                console.error("별점을 저장하는 데 문제가 발생했습니다.");
            }
        } catch (error) {
            console.error("별점을 저장하는 중 오류가 발생했습니다:", error);
        }
    };

    const handleCardClick = (theater) => {
        const regionColors = {
            '서울': '#AEAFB9',
            '인천': 'red',
            '경기': 'orange',
            '강원': 'yellow',
            '대전': '#7FFF00',
            '세종': 'green',
            '충남': 'skyblue',
            '충북': '#00CED1',
            '광주': 'blue',
            '전남': '#00008B',
            '전북': 'purple',
            '경남': 'pink',
            '경북': '#8A2BE2',
            '대구': '#A52A2A',
            '부산': '#808000',
            '울산': '#FFB07C',
            '제주': '#ADD8E6',
            default: '#AEAFB9'
        };

        setCurrentMovies([]);

        axios.get(`https://filmme-drf-deploy-932ced3808f2.herokuapp.com/api/cinemas/detail/${theater.id}/`)
            .then(response => {
                const movies = response.data.movies || [];
                setCurrentMovies(movies);

                setModalContent({
                    id: theater.id,
                    name: theater.name,
                    region: theater.location,
                    discription: theater.discription,
                    view_url: theater.view_url,
                    cite_url: theater.cite_url,
                    regionColor: regionColors[theater.location] || regionColors.default,
                    movies: movies,
                    tel: theater.tel,
                    location: theater.detail_loc
                });

                setShowModal(true);
            })
            .catch(error => {
                console.error("현재 상영 중인 영화를 가져오는 중 오류가 발생했습니다:", error);
            });
    }

    return (
        <>
            <S.MainWrapper>
                <S.TitleWrapper>
                    <S.Title>FILM'E</S.Title>
                    <S.subTitle>전국의 독립예술영화관 모아보기</S.subTitle>
                </S.TitleWrapper>
                <div className="Search">
                    <S.searchBox>
                        <S.Input
                            type="text"
                            placeholder={isPlaceholderHidden ? "" : "검색어를 입력하세요."}
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            onFocus={() => setIsPlaceholderHidden(true)}
                            onBlur={() => setIsPlaceholderHidden(searchQuery !== "")
                            }
                        />
                    </S.searchBox>
                    <S.searchImage src={searchImage} alt="searchImage" />
                </div>
                <div className="Region">
                    <S.regionContainer>
                        {renderRegions()}
                    </S.regionContainer>
                </div>
                <div className="Sort">
                    <S.SortContainer>
                        <select onChange={(e) => handleSortChange(e.target.value)}>
                            {sortOptions.map((option, index) => (
                                <option key={index} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </S.SortContainer>
                </div>
                <div className="Theater">
                    <S.TheaterContainer data-aos="fade-down">
                        {ViewTheater()}
                    </S.TheaterContainer>
                </div>
            </S.MainWrapper>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                content={modalContent}
                rating={rating}
                setRating={setRating}
                handleSaveRating={handleSaveRating}
            />
        </>
    );
}

export default Main;
