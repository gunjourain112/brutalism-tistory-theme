# Roaring Bitmap으로 메모리 사용량 90% 절감하기

월 1억 건의 사용자 세그먼트 데이터를 처리하는 시스템에서 Roaring Bitmap을 도입하여 메모리 사용량을 대폭 줄이고 쿼리 성능을 10배 향상시킨 실전 경험을 공유합니다.

## // 문제_상황

광고 타게팅 시스템에서 1억 명의 사용자를 100개 세그먼트로 분류하여 관리하고 있었습니다. 각 세그먼트는 평균 1천만 명의 사용자 ID를 포함하며, 기존에는 `map[int64]bool`로 저장했습니다.

**문제점:**
- 메모리 사용량: 세그먼트당 약 800MB (총 80GB)
- 세그먼트 간 교집합/합집합 연산 시 성능 저하
- Redis 캐싱 불가 (메모리 부족)

## // 해결_방법

Roaring Bitmap은 정수 집합을 압축하여 저장하는 자료구조입니다. 특히 연속된 정수나 클러스터링된 데이터에서 압축률이 뛰어납니다.

### 구현_코드

```go
// Before: 기존 방식
type UserSegment struct {
    UserIDs map[int64]bool  // 800MB
}

func (s *UserSegment) Contains(userID int64) bool {
    return s.UserIDs[userID]
}

// After: Roaring Bitmap
import "github.com/RoaringBitmap/roaring"

type UserSegment struct {
    Bitmap *roaring.Bitmap  // 80MB (90% 절감)
}

func (s *UserSegment) Contains(userID uint32) bool {
    return s.Bitmap.Contains(userID)
}

func (s *UserSegment) Add(userID uint32) {
    s.Bitmap.Add(userID)
}

func (s *UserSegment) Union(other *UserSegment) *UserSegment {
    result := roaring.Or(s.Bitmap, other.Bitmap)
    return &UserSegment{Bitmap: result}
}
```

### 추가 예시: 세그먼트 필터링

```go
package main

import (
    "fmt"
    "github.com/RoaringBitmap/roaring"
)

type SegmentManager struct {
    segments map[string]*roaring.Bitmap
}

func NewSegmentManager() *SegmentManager {
    return &SegmentManager{
        segments: make(map[string]*roaring.Bitmap),
    }
}

func (sm *SegmentManager) AddUserToSegment(segmentName string, userID uint32) {
    if sm.segments[segmentName] == nil {
        sm.segments[segmentName] = roaring.New()
    }
    sm.segments[segmentName].Add(userID)
}

func (sm *SegmentManager) GetTargetUsers(includeSegments, excludeSegments []string) *roaring.Bitmap {
    result := roaring.New()
    
    // 포함할 세그먼트들의 합집합
    for _, seg := range includeSegments {
        if bm := sm.segments[seg]; bm != nil {
            result.Or(bm)
        }
    }
    
    // 제외할 세그먼트들 빼기
    for _, seg := range excludeSegments {
        if bm := sm.segments[seg]; bm != nil {
            result.AndNot(bm)
        }
    }
    
    return result
}

func main() {
    sm := NewSegmentManager()
    
    // 세그먼트 데이터 추가
    for i := uint32(0); i < 1000000; i++ {
        if i%2 == 0 {
            sm.AddUserToSegment("premium", i)
        }
        if i%3 == 0 {
            sm.AddUserToSegment("active", i)
        }
    }
    
    // 타겟 사용자 조회: premium이면서 active가 아닌 사용자
    targets := sm.GetTargetUsers([]string{"premium"}, []string{"active"})
    fmt.Printf("Target users: %d\n", targets.GetCardinality())
}
```

## // 성능_비교

| 항목 | 기존 (SET) | ROARING BITMAP | 개선율 |
|------|-----------|----------------|--------|
| 메모리 | 800MB | 80MB | 90% ↓ |
| Contains | 50ns | 30ns | 40% ↑ |
| Union | 2.5s | 250ms | 10x ↑ |
| Intersection | 3.0s | 180ms | 16x ↑ |

## // 실전_적용_팁

- **직렬화:** Roaring Bitmap은 바이너리 직렬화를 지원하여 Redis나 파일에 효율적으로 저장 가능
- **병렬 처리:** 여러 Bitmap을 동시에 처리할 때 goroutine 활용
- **캐싱 전략:** 자주 사용되는 세그먼트는 메모리에 캐싱
- **모니터링:** 압축률과 쿼리 성능을 지속적으로 모니터링

## // 주의사항

> **⚠️ 중요**
> 
> Roaring Bitmap은 32비트 정수만 지원합니다. 64비트 ID를 사용한다면:
> - 상위 32비트를 키로, 하위 32비트를 Bitmap에 저장
> - 또는 `roaring64` 라이브러리 사용

## // 결론

**최종 결과:**
- 메모리 사용량: 80GB → 8GB (90% 절감)
- 쿼리 응답 시간: 3초 → 300ms (10배 향상)
- Redis 캐싱 가능 → 전체 시스템 성능 대폭 개선

대용량 정수 집합을 다루는 시스템이라면 Roaring Bitmap을 적극 검토해보시길 추천합니다.

---

**Tags:** #GOLANG #PERFORMANCE #OPTIMIZATION #ROARING_BITMAP #DATA_STRUCTURE
