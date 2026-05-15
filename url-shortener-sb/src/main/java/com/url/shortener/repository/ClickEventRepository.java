package com.url.shortener.repository;

import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {
   List<ClickEvent> findByUrlMappingAndClickDateBetween(UrlMapping mapping, LocalDateTime startDate, LocalDateTime endDate);
   List<ClickEvent> findByUrlMappingInAndClickDateBetween(List<UrlMapping> urlMappings, LocalDateTime startDate, LocalDateTime endDate);
   void deleteByUrlMapping(UrlMapping urlMapping);

   @Query("""
      select ce.urlMapping.shortUrl as shortUrl, count(ce) as clicks
      from ClickEvent ce
      where ce.urlMapping.user = :user
        and ce.clickDate >= :start
        and ce.clickDate < :end
      group by ce.urlMapping.shortUrl
      order by count(ce) desc
   """)
   List<TopLinkRow> findTopLinksForUser(
           @Param("user") User user,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end,
           Pageable pageable
   );

   interface TopLinkRow {
      String getShortUrl();
      long getClicks();
   }

   @Query("""
      select coalesce(ce.referrer, '(direct)') as key, count(ce) as clicks
      from ClickEvent ce
      where ce.urlMapping.user = :user
        and ce.clickDate >= :start
        and ce.clickDate < :end
      group by coalesce(ce.referrer, '(direct)')
      order by count(ce) desc
   """)
   List<KeyCountRow> referrerBreakdown(
           @Param("user") User user,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end,
           Pageable pageable
   );

   @Query("""
      select coalesce(ce.deviceType, 'other') as key, count(ce) as clicks
      from ClickEvent ce
      where ce.urlMapping.user = :user
        and ce.clickDate >= :start
        and ce.clickDate < :end
      group by coalesce(ce.deviceType, 'other')
      order by count(ce) desc
   """)
   List<KeyCountRow> deviceBreakdown(
           @Param("user") User user,
           @Param("start") LocalDateTime start,
           @Param("end") LocalDateTime end,
           Pageable pageable
   );

   interface KeyCountRow {
      String getKey();
      long getClicks();
   }
}
